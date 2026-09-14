export interface User {
  id: string
  name: string
  email: string
  location?: string | null
  image?: string | null
  createdAt: string
}

export type Priority = 'URGENT' | 'NORMAL' | 'LOW'

export interface PatientConsultation {
  id: string
  hospitalId: string
  patientIdentifier: string | null
  rawTranscript: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  icd10Codes: string[]
  Priority: Priority
  createdAt: string
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
