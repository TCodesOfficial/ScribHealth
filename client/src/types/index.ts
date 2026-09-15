export interface User {
  id: string
  name: string
  email: string
  location?: string | null
  image?: string | null
  createdAt: string
}

export type Priority = 'URGENT' | 'NORMAL' | 'LOW'

export interface Patient {
  id: string
  hospitalId: string
  mrn: string | null
  firstName: string
  lastName: string
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  consultations?: PatientConsultation[]
  _count?: { consultations: number }
}

export interface PatientConsultation {
  id: string
  hospitalId: string
  patientId: string
  patient: Patient
  rawTranscript: string
  subjective: string = 'Not documented in transcript'
  objective: string = 'Not documented in transcript'
  assessment: string = 'Not documented in transcript'
  plan: string = 'Not documented in transcript'
  icd10Codes: string[] = []
  Priority: Priority
  createdAt: string
  generatedSoapNote?: string
}

export interface ApiResponse<T = unknown> {
  statusCode: number
  error: boolean
  message: string
  data: T | null
}

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface Session {
  user: AuthUser
}
