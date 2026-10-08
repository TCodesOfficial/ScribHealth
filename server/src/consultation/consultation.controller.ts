import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/auth.guard.js";
import { User } from "../user/user.decorator.js";
import { ConsultationService } from "./consultation.service.js";

const AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/flac",
  "audio/x-flac",
];

@Controller("consultation")
@UseGuards(AuthGuard)
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post("process-audio")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (
          AUDIO_MIMES.includes(file.mimetype) ||
          file.mimetype.startsWith("audio/")
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException("Only audio files are accepted"), false);
        }
      },
    }),
  )
  async processAudio(
    @UploadedFile() file: Express.Multer.File,
    @User() user: { id: string },
    @Body("mrn") mrn?: string,
    @Body("firstName") firstName?: string,
    @Body("lastName") lastName?: string,
    @Body("gender") gender?: string,
    @Body("dateOfBirth") dateOfBirth?: string,
    @Body("phone") phone?: string,
  ) {
    if (!file) {
      throw new BadRequestException("No audio file provided");
    }

    return this.consultationService.processAudio(
      file.buffer,
      file.mimetype,
      file.originalname,
      user.id,
      { mrn, firstName, lastName, gender, dateOfBirth, phone },
    );
  }

  @Get("history")
  async getHistory(@User() user: { id: string }) {
    return this.consultationService.getHospitalHistory(user.id);
  }

  @Get(":id")
  async getConsultation(
    @Param("id") id: string,
    @User() user: { id: string },
  ) {
    return this.consultationService.getConsultationById(id, user.id);
  }

  @Put(":id")
  async updateConsultation(
    @Param("id") id: string,
    @User() user: { id: string },
    @Body() body: { subjective?: string; objective?: string; assessment?: string; plan?: string },
  ) {
    return this.consultationService.updateConsultation(id, user.id, body);
  }

  @Get(":id/audio")
  async getAudio(
    @Param("id") id: string,
    @User() user: { id: string },
  ) {
    return this.consultationService.getConsultationAudio(id, user.id);
  }
}
