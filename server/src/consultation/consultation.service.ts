import {
  BadGatewayException,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import axios from "axios";
import FormData from "form-data";
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
    form: FormData,
    headers: Record<string, string>,
    maxRetries = 4,
    retryDelayMs = 1500,
  ): Promise<IntronTranscriptionResponse> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Intron upload attempt ${attempt}/${maxRetries}`);
        const response = await axios.post<IntronTranscriptionResponse>(
          this.intronApiUrl,
          form,
          { headers, timeout: 30000 },
        );
        return response.data;
      } catch (error) {
        lastError = error;
        const retryable = this.isRetryableError(error);
        if (attempt < maxRetries && retryable) {
          const msg = axios.isAxiosError(error) ? error.message : String(error);
          this.logger.warn(
            `Intron attempt ${attempt}/${maxRetries} failed (${msg}), retrying in ${retryDelayMs}ms...`,
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
      throw new InternalServerErrorException("Intron API key is not configured");
    }

    const form = new FormData();
    form.append("audio_file_name", originalName);
    form.append("audio_file_blob", fileBuffer, {
      filename: originalName,
      contentType: mimeType,
    });
    form.append("use_category", "file_category_telehealth");
    form.append("use_language_asr_input", "en");

    try {
      const data = await this.uploadToIntron(form, {
        ...form.getHeaders(),
        Authorization: `Bearer ${intronApiKey}`,
      });

      const status = data.data.processing_status;
      const fileId = data.data.file_id || "unknown-file-id";

      if (status === "FILE_TRANSCRIBED") {
        return { transcript: data.data.audio_transcript, fileId };
      }

      if (status === "FILE_PROCESSING_FAILED") {
        this.logger.error("Intron transcription failed: FILE_PROCESSING_FAILED");
        throw new BadGatewayException("Transcription processing failed");
      }

      this.logger.log(`Intron file queued (status: ${status}), polling for result...`);
      const transcript = await this.pollIntronStatus(fileId, intronApiKey);
      return { transcript, fileId };
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;

      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.message || error.message;
        this.logger.error(`Intron API error: ${detail}`);
        if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
          throw new BadGatewayException("Transcription service timeout after retries");
        }
        throw new BadGatewayException(`Transcription service error: ${detail}`);
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
          throw new BadGatewayException("Transcription processing failed");
        }
      } catch (error) {
        if (error instanceof BadGatewayException) throw error;
        this.logger.warn(`Intron poll attempt ${attempt + 1} failed, retrying...`);
      }
    }

    throw new BadGatewayException("Transcription timed out after polling");
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
        throw new BadGatewayException(
          `Clinical extraction missing required field: ${field}`,
        );
      }
    }

    if (!Array.isArray(data.icd10Codes)) {
      throw new BadGatewayException("icd10Codes must be an array");
    }

    data.Priority = data.Priority?.toUpperCase()?.trim() as "URGENT" | "NORMAL" | "LOW";
    if (!["URGENT", "NORMAL", "LOW"].includes(data.Priority)) {
      throw new BadGatewayException(
        "Priority must be URGENT, NORMAL, or LOW",
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
        this.logger.error(`Failed to parse Groq response: ${error.message}`);
        throw new BadGatewayException(
          "Failed to parse clinical extraction response",
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
    const patient = await this.patientService.upsertPatient(userId, {
      mrn: patientData?.mrn,
      firstName: patientData?.firstName,
      lastName: patientData?.lastName,
      gender: patientData?.gender,
      dateOfBirth: patientData?.dateOfBirth,
      phone: patientData?.phone,
    });

    const result = await this.transcribeAudio(
      fileBuffer,
      mimeType,
      originalName,
    );

    const transcript = result.transcript;
    const fileId = result.fileId;

    if (!transcript || transcript.trim().length === 0) {
      throw new UnprocessableEntityException(
        "No speech detected in the audio file",
      );
    }

    const extraction = await this.extractClinicalData(transcript);

    console.log('SAVING CONSULTATION - subjective:', extraction.subjective?.substring(0, 100));
    console.log('SAVING CONSULTATION - objective:', extraction.objective?.substring(0, 100));
    console.log('SAVING CONSULTATION - assessment:', extraction.assessment?.substring(0, 100));
    console.log('SAVING CONSULTATION - plan:', extraction.plan?.substring(0, 100));

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
    });

    return consultation;
  }

  async updateConsultation(
    id: string,
    hospitalId: string,
    data: { subjective?: string; objective?: string; assessment?: string; plan?: string },
  ) {
    const consultation = await this.prisma.patientConsultation.findFirst({
      where: { id, hospitalId },
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
    });
  }

  async getIntronAudio(id: string, hospitalId: string) {
    const consultation = await this.prisma.patientConsultation.findFirst({
      where: { id, hospitalId },
    });
    if (!consultation || !consultation.intronFileId) {
      throw new NotFoundException("Consultation or Intron audio reference not found");
    }
    const intronApiKey = process.env.INTRON_API_KEY;
    try {
      const response = await axios.get(
        `${this.intronStatusUrl}/${consultation.intronFileId}`,
        {
          headers: { Authorization: `Bearer ${intronApiKey}` },
          timeout: 30000,
        },
      );
      return response.data;
    } catch {
      throw new BadGatewayException("Failed to fetch audio from Intron");
    }
  }

  async getHospitalHistory(userId: string) {
    return this.prisma.patientConsultation.findMany({
      where: { hospitalId: userId },
      orderBy: { createdAt: "desc" },
      include: { patient: true },
    });
  }

  async getConsultationById(id: string, userId: string) {
    const consultation = await this.prisma.patientConsultation.findFirst({
      where: { id, hospitalId: userId },
      include: { patient: true },
    });

    if (!consultation) {
      throw new NotFoundException("Consultation not found");
    }

    return consultation;
  }
}
