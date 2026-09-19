import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { User } from "../user/user.decorator.js";
import { PatientService } from "./patient.service.js";
import type { UpsertPatientDTO } from "./patient.service.js";

@Controller("patient")
@UseGuards(AuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  async getPatients(@User() user: { id: string }) {
    return this.patientService.getPatientsByHospital(user.id);
  }

  @Get("search")
  async searchPatients(
    @User() user: { id: string },
    @Query("q") query: string,
  ) {
    return this.patientService.searchPatients(user.id, query);
  }

  @Get(":id")
  async getPatient(
    @Param("id") id: string,
    @User() user: { id: string },
  ) {
    return this.patientService.getPatientById(id, user.id);
  }

  @Put(":id")
  async updatePatient(
    @Param("id") id: string,
    @User() user: { id: string },
    @Body() body: UpsertPatientDTO,
  ) {
    return this.patientService.updatePatient(id, user.id, body);
  }
}
