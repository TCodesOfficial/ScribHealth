import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import Groq from "groq-sdk";

@Injectable()
export class GroqService implements OnModuleInit {
  private groq: Groq | null = null;
  private readonly logger = new Logger(GroqService.name);

  onModuleInit() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      this.logger.warn(
        "GROQ_API_KEY not configured — Groq features will be disabled",
      );
      return;
    }
    this.groq = new Groq({ apiKey });
    this.logger.log("Groq SDK initialized successfully");
  }

  private getGroqClient(): Groq {
    if (!this.groq) {
      throw new InternalServerErrorException(
        "Note generation is unavailable. Please contact your administrator.",
      );
    }
    return this.groq;
  }

  async chatCompletion(params: {
    model?: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    response_format?: { type: "json_object" };
    temperature?: number;
  }): Promise<string> {
    const groq = this.getGroqClient();

    const models = params.model
      ? [params.model, "openai/gpt-oss-120b"]
      : ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];

    for (const model of models) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: params.messages,
          response_format: params.response_format,
          temperature: params.temperature ?? 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          this.logger.error(`Empty response from model ${model}`);
          throw new BadGatewayException(
            "Note generation returned an empty response. Please try again.",
          );
        }

        this.logger.log(`Groq chat completed — model: ${model}, tokens: ${response.usage?.total_tokens ?? "unknown"}`);
        return content;
      } catch (error) {
        if (error instanceof BadGatewayException) throw error;

        const msg =
          error instanceof Groq.APIError
            ? error.message
            : error instanceof Error
              ? error.message
              : String(error);

        const isModelUnavailable =
          msg.includes("does not exist") ||
          msg.includes("not have access") ||
          msg.includes("not available") ||
          msg.includes("model_not_found");

        if (isModelUnavailable) {
          this.logger.warn(
            `Model ${model} unavailable: ${msg} — trying next...`,
          );
          continue;
        }

        if (error instanceof Groq.AuthenticationError) {
          this.logger.error(`Authentication failed: ${msg}`);
          throw new BadGatewayException(
            "Note generation is unavailable. Please contact your administrator.",
          );
        }

        if (error instanceof Groq.RateLimitError) {
          this.logger.error(`Rate limit exceeded: ${msg}`);
          throw new BadGatewayException(
            "Note generation is busy right now. Please try again in a moment.",
          );
        }

        this.logger.error(`Model error (${model}): ${msg}`);
        throw new BadGatewayException(
          "Failed to generate documentation. Please try again.",
        );
      }
    }

    this.logger.error("All models failed");
    throw new BadGatewayException(
      "Note generation is unavailable right now. Please try again later.",
    );
  }

  async transcribeAudio(params: {
    fileBuffer: Buffer;
    mimeType: string;
    fileName: string;
  }): Promise<string> {
    const groq = this.getGroqClient();

    const file = await Groq.toFile(params.fileBuffer, params.fileName, {
      type: params.mimeType,
    });

    const response = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      language: "en",
    });

    return response.text;
  }
}
