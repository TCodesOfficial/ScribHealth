import {
  BadGatewayException,
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
  UnprocessableEntityException,
} from "@nestjs/common";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import { GroqService } from "../groq/groq.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PatientService } from "../patient/patient.service.js";
import type { ClinicalExtraction, IntronTranscriptionResponse } from "./dto/consultation-response.dto.js";

interface PatientData {
  mrn?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
}

@Injectable()
export class ConsultationService {
  private readonly logger = new Logger(ConsultationService.name);

  private readonly intronApiUrl =
    "https://infer.voice.intron.io/file/v1/upload/sync";
  private readonly intronStatusUrl =
    "https://infer.voice.intron.io/file/v1/status";

  private static readonly AUDIO_EXTENSIONS: Record<string, string> = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/mp4": ".m4a",
    "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/flac": ".flac",
    "audio/x-flac": ".flac",
  };

  private static readonly AUDIO_MIME_BY_EXT: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".webm": "audio/webm",
    ".m4a": "audio/mp4",
    ".flac": "audio/flac",
  };

  private audioDir(): string {
    if (process.env.UPLOAD_DIR) {
      return path.resolve(process.env.UPLOAD_DIR);
    }
    return path.join(process.cwd(), "uploads", "consultations");
  }

  private async storeConsultationAudio(
    consultationId: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    try {
      await this.prisma.patientConsultation.update({
        where: { id: consultationId },
        data: {
          audioData: new Uint8Array(fileBuffer),
          audioMimeType: mimeType,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to store audio for consultation ${consultationId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private readonly clinicalExtractionPrompt = `You are a clinical documentation assistant. Analyze the following medical consultation transcript and extract structured clinical data.

Return ONLY valid JSON with this exact structure:
{
  "subjective": "Patient's reported symptoms, complaints, and history in their own words or paraphrased",
  "objective": "Observable findings, vital signs, physical exam results mentioned",
  "assessment": "Clinical impression, differential diagnoses, working diagnosis",
  "plan": "Treatment plan, medications prescribed, procedures ordered, follow-up instructions",
  "icd10Codes": ["ICD-10-CM codes relevant to the encounter"],
  "Priority": "URGENT" | "NORMAL" | "LOW",
  "recommendedWard": "Recommended hospital department or ward for patient posting (e.g. Cardiology, Emergency Department, General Medicine, ICU, Orthopedics, Pediatrics)"
}

Rules:
- subjective: Focus on what the patient reports (symptoms, duration, severity, history)
- objective: Focus on what the clinician observes (examination findings, vitals, tests)
- assessment: Clinical reasoning and diagnosis
- plan: Actionable next steps (medications, referrals, lifestyle advice, follow-up)
- icd10Codes: Use ICD-10-CM codes. Include as many as clinically appropriate.
- Priority: URGENT = life-threatening or needs immediate intervention, NORMAL = standard care, LOW = routine/follow-up
- Synthesize appropriate clinical findings, objective examination, assessment, and plan based on standard of care for the reported symptoms
- Do NOT include any text outside the JSON object`;

  constructor(
    private readonly prisma: PrismaService,
    private readonly patientService: PatientService,
    private readonly groqService: GroqService,
  ) {}

  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      if (
        error.code === "ECONNABORTED" ||
        error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.code === "ETIMEDOUT"
      ) {
        return true;
      }
      if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
        return true;
      }
    }
    return false;
  }

  private async uploadToIntron(
    buildRequest: () => { form: FormData; headers: Record<string, string> },
    maxRetries = 4,
    retryDelayMs = 1500,
  ): Promise<IntronTranscriptionResponse> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Intron upload attempt ${attempt}/${maxRetries}`);
        // FormData is a single-use stream: build a fresh instance (and its
        // multipart headers/boundary) for every attempt or retries re-send a
        // spent body and stall until timeout.
        const { form, headers } = buildRequest();
        const response = await axios.post<IntronTranscriptionResponse>(
          this.intronApiUrl,
          form,
          { headers, timeout: 60000 },
        );
        return response.data;
      } catch (error) {
        lastError = error;
        const retryable = this.isRetryableError(error);
        if (attempt < maxRetries && retryable) {
          const detail = axios.isAxiosError(error)
            ? error.response?.status
              ? `HTTP ${error.response.status}`
              : error.code || error.message
            : String(error);
          this.logger.warn(
            `Intron attempt ${attempt}/${maxRetries} failed (${detail}), retrying in ${retryDelayMs}ms...`,
          );
          await new Promise((r) => setTimeout(r, retryDelayMs));
        } else if (!retryable) {
          throw error;
        }
      }
    }
    throw lastError;
  }

  private async transcribeAudio(
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<{ transcript: string; fileId: string }> {
    const intronApiKey = process.env.INTRON_API_KEY;
    if (!intronApiKey) {
      throw new InternalServerErrorException(
        "Audio processing is not configured. Please contact your administrator.",
      );
    }

    // Strip codec parameters (e.g. "audio/webm;codecs=opus" -> "audio/webm"):
    // Intron's docs only show plain mime types for the multipart part.
    const normalizedMime = mimeType.split(";")[0].trim() || "application/octet-stream";

    const buildRequest = () => {
      const form = new FormData();
      form.append("audio_file_name", originalName);
      form.append("audio_file_blob", fileBuffer, {
        filename: originalName,
        contentType: normalizedMime,
      });
      form.append("use_category", "file_category_telehealth");
      form.append("use_language_asr_input", "en");
      return {
        form,
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${intronApiKey}`,
        },
      };
    };

    try {
      const data = await this.uploadToIntron(buildRequest);

      const status = data.data.processing_status;
      const fileId = data.data.file_id || "unknown-file-id";

      if (status === "FILE_TRANSCRIBED") {
        return { transcript: data.data.audio_transcript, fileId };
      }

      if (status === "FILE_PROCESSING_FAILED") {
        this.logger.error("Transcription failed: FILE_PROCESSING_FAILED");
        throw new BadGatewayException(
          "Unable to process the recording. Please try again.",
        );
      }

      this.logger.log(`File queued (status: ${status}), polling for result...`);
      const transcript = await this.pollIntronStatus(fileId, intronApiKey);
      return { transcript, fileId };
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;

      if (axios.isAxiosError(error)) {
        const httpStatus = error.response?.status
          ? ` (HTTP ${error.response.status})`
          : "";
        const detail = (error.response?.data?.message || error.message) + httpStatus;
        this.logger.error(`Transcription API error: ${detail}`);
        if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
          throw new BadGatewayException(
            "Processing is taking longer than expected. Please try again.",
          );
        }
        throw new BadGatewayException(
          "Unable to process the recording. Please try again.",
        );
      }

      throw error;
    }
  }

  private async pollIntronStatus(
    fileId: string,
    apiKey: string,
    maxRetries = 60,
    intervalMs = 5000,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      try {
        const response = await axios.get<IntronTranscriptionResponse>(
          `${this.intronStatusUrl}/${fileId}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 30000,
          },
        );

        const status = response.data.data.processing_status;
        this.logger.log(`Intron poll attempt ${attempt + 1}/${maxRetries}: ${status}`);

        if (status === "FILE_TRANSCRIBED") {
          return response.data.data.audio_transcript;
        }

        if (status === "FILE_PROCESSING_FAILED") {
          this.logger.error("Transcription failed during polling: FILE_PROCESSING_FAILED");
          throw new BadGatewayException(
            "Unable to process the recording. Please try again.",
          );
        }
      } catch (error) {
        if (error instanceof BadGatewayException) throw error;
        this.logger.warn(`Poll attempt ${attempt + 1} failed, retrying...`);
      }
    }

    throw new BadGatewayException(
      "Processing took too long. Please try again.",
    );
  }

  private validateClinicalExtraction(data: ClinicalExtraction): void {
    const requiredFields = [
      "subjective",
      "objective",
      "assessment",
      "plan",
      "icd10Codes",
      "Priority",
    ] as const;

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        this.logger.error(`Clinical extraction missing required field: ${field}`);
        throw new BadGatewayException(
          "Failed to generate documentation. Please try again.",
        );
      }
    }

    if (!Array.isArray(data.icd10Codes)) {
      this.logger.error("Clinical extraction icd10Codes is not an array");
      throw new BadGatewayException(
        "Failed to generate documentation. Please try again.",
      );
    }

    data.Priority = data.Priority?.toUpperCase()?.trim() as "URGENT" | "NORMAL" | "LOW";
    if (!["URGENT", "NORMAL", "LOW"].includes(data.Priority)) {
      this.logger.error(`Clinical extraction has invalid Priority: ${data.Priority}`);
      throw new BadGatewayException(
        "Failed to generate documentation. Please try again.",
      );
    }
  }

  private async extractClinicalData(
    transcript: string,
  ): Promise<ClinicalExtraction> {
    try {
      const content = await this.groqService.chatCompletion({
        messages: [
          { role: "system", content: this.clinicalExtractionPrompt },
          { role: "user", content: transcript },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      console.log('GROQ RAW RESPONSE:', content);

      const parsed = JSON.parse(content) as ClinicalExtraction;

      this.validateClinicalExtraction(parsed);

      console.log('GROQ PARSED EXTRACTION:', JSON.stringify(parsed, null, 2));

      return parsed;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;

      if (error instanceof SyntaxError) {
        this.logger.error(`Failed to parse extraction response: ${error.message}`);
        throw new BadGatewayException(
          "Failed to generate documentation. Please try again.",
        );
      }

      throw error;
    }
  }

  async processAudio(
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string,
    userId: string,
    patientData?: PatientData,
  ) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException(
        "The uploaded audio file is empty. Please record again.",
      );
    }
    this.logger.log(
      `Processing audio: name=${originalName}, mime=${mimeType}, bytes=${fileBuffer.length}`,
    );

    const result = await this.transcribeAudio(
      fileBuffer,
      mimeType,
      originalName,
    );

    const transcript = result.transcript;
    const fileId = result.fileId;

    if (!transcript || transcript.trim().length === 0) {
      this.logger.warn(
        `Empty transcript from Intron (fileId=${fileId}, bytes=${fileBuffer.length}, mime=${mimeType})`,
      );
      throw new UnprocessableEntityException(
        "No speech detected in the audio file",
      );
    }

    const extraction = await this.extractClinicalData(transcript);

    console.log('SAVING CONSULTATION - subjective:', extraction.subjective?.substring(0, 100));
    console.log('SAVING CONSULTATION - objective:', extraction.objective?.substring(0, 100));
    console.log('SAVING CONSULTATION - assessment:', extraction.assessment?.substring(0, 100));
    console.log('SAVING CONSULTATION - plan:', extraction.plan?.substring(0, 100));

    // Upsert the patient only after transcription + extraction succeed so a
    // failed run never leaves orphan WALKIN-* patients with no consultations.
    const patient = await this.patientService.upsertPatient(userId, {
      mrn: patientData?.mrn,
      firstName: patientData?.firstName,
      lastName: patientData?.lastName,
      gender: patientData?.gender,
      dateOfBirth: patientData?.dateOfBirth,
      phone: patientData?.phone,
    });

    const consultation = await this.prisma.patientConsultation.create({
      data: {
        hospitalId: userId,
        patientId: patient.id,
        rawTranscript: transcript,
        subjective: extraction.subjective,
        objective: extraction.objective,
        assessment: extraction.assessment,
        plan: extraction.plan,
        icd10Codes: extraction.icd10Codes,
         Priority: extraction.Priority,
         recommendedWard: extraction.recommendedWard || "General Ward",
         intronFileId: fileId,
      },
      include: { patient: true },
      omit: { audioData: true },
    });

    await this.storeConsultationAudio(consultation.id, fileBuffer, mimeType);

    return consultation;
  }

  async updateConsultation(
    id: string,
    hospitalId: string,
    data: { subjective?: string; objective?: string; assessment?: string; plan?: string },
  ) {
    const consultation = await this.prisma.patientConsultation.findFirst({
      where: { id, hospitalId },
      omit: { audioData: true },
    });
    if (!consultation) {
      throw new NotFoundException("Consultation not found");
    }
    return this.prisma.patientConsultation.update({
      where: { id },
      data: {
        ...(data.subjective !== undefined && { subjective: data.subjective }),
        ...(data.objective !== undefined && { objective: data.objective }),
        ...(data.assessment !== undefined && { assessment: data.assessment }),
        ...(data.plan !== undefined && { plan: data.plan }),
      },
      include: { patient: true },
      omit: { audioData: true },
    });
  }

  async getConsultationAudio(
    id: string,
    hospitalId: string,
  ): Promise<StreamableFile> {
    const consultation = await this.prisma.patientConsultation.findFirst({
      where: { id, hospitalId },
      select: { id: true, audioData: true, audioMimeType: true },
    });
    if (!consultation) {
      throw new NotFoundException("Consultation not found");
    }

    if (consultation.audioData && consultation.audioData.length > 0) {
      const type = consultation.audioMimeType || "application/octet-stream";
      const ext = ConsultationService.AUDIO_EXTENSIONS[type] || "";
      return new StreamableFile(Buffer.from(consultation.audioData), {
        type,
        disposition: `inline; filename="consultation-audio${ext}"`,
      });
    }

    // Legacy fallback: recordings stored on disk before audio moved to the database
    const dir = this.audioDir();
    let fileName: string | undefined;
    try {
      const entries = fs.readdirSync(dir);
      fileName = entries.find((entry) => entry.startsWith(`${id}.`));
    } catch {
      fileName = undefined;
    }

    if (!fileName) {
      throw new NotFoundException(
        "Original audio is not available for this recording",
      );
    }

    const ext = path.extname(fileName).toLowerCase();
    const type = ConsultationService.AUDIO_MIME_BY_EXT[ext] || "application/octet-stream";

    return new StreamableFile(fs.createReadStream(path.join(dir, fileName)), {
      type,
      disposition: `inline; filename="consultation-audio${ext}"`,
    });
  }

  async getHospitalHistory(userId: string) {
    return this.prisma.patientConsultation.findMany({
      where: { hospitalId: userId },
      orderBy: { createdAt: "desc" },
      include: { patient: true },
      omit: { audioData: true },
    });
  }

  async getConsultationById(id: string, userId: string) {
    const consultation = await this.prisma.patientConsultation.findFirst({
      where: { id, hospitalId: userId },
      include: { patient: true },
      omit: { audioData: true },
    });

    if (!consultation) {
      throw new NotFoundException("Consultation not found");
    }

    return consultation;
  }
}
