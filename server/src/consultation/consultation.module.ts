import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PatientModule } from "../patient/patient.module.js";
import { ConsultationController } from "./consultation.controller.js";
import { ConsultationService } from "./consultation.service.js";

@Module({
  imports: [AuthModule, PrismaModule, PatientModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
})
export class ConsultationModule {}
