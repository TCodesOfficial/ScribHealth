import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

export interface UpsertPatientDTO {
  mrn?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
}

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatientsByHospital(hospitalId: string) {
    return this.prisma.patient.findMany({
      where: { hospitalId },
      orderBy: { updatedAt: "desc" },
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, createdAt: true, Priority: true },
        },
        _count: { select: { consultations: true } },
      },
    });
  }

  async getPatientById(id: string, hospitalId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, hospitalId },
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          include: { patient: true },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    return patient;
  }

  async updatePatient(id: string, hospitalId: string, data: UpsertPatientDTO) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, hospitalId },
    });
    if (!patient) {
      throw new NotFoundException("Patient not found");
    }
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...(data.mrn !== undefined && { mrn: data.mrn }),
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });
  }

  async searchPatients(hospitalId: string, query: string) {
    if (!query || query.trim().length === 0) {
      return this.prisma.patient.findMany({
        where: { hospitalId },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });
    }

    const search = query.trim().toLowerCase();

    return this.prisma.patient.findMany({
      where: {
        hospitalId,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { mrn: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  }

  async upsertPatient(hospitalId: string, data: UpsertPatientDTO) {
    const targetMrn = data.mrn || `WALKIN-${Date.now().toString().slice(-6)}`;

    return this.prisma.patient.upsert({
      where: {
        hospitalId_mrn: {
          hospitalId,
          mrn: targetMrn,
        },
      },
      update: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.gender && { gender: data.gender }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.phone && { phone: data.phone }),
      },
      create: {
        hospitalId,
        mrn: targetMrn,
        firstName: data.firstName || "Walk-in",
        lastName: data.lastName || "Patient",
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        phone: data.phone || null,
      },
    });
  }
}
