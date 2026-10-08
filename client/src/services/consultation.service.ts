import apiClient from '@/config/axios'
import { getCachedAudio, putCachedAudio } from '@/lib/audioCache'
import type { PatientConsultation } from '@/types'

interface PatientData {
  mrn?: string
  firstName?: string
  lastName?: string
  gender?: string
  dateOfBirth?: string
  phone?: string
}

const consultationService = {
  async processAudio(file: File, patientData?: PatientData): Promise<PatientConsultation> {
    const formData = new FormData()
    formData.append('file', file)

    if (patientData?.mrn) formData.append('mrn', patientData.mrn)
    if (patientData?.firstName) formData.append('firstName', patientData.firstName)
    if (patientData?.lastName) formData.append('lastName', patientData.lastName)
    if (patientData?.gender) formData.append('gender', patientData.gender)
    if (patientData?.dateOfBirth) formData.append('dateOfBirth', patientData.dateOfBirth)
    if (patientData?.phone) formData.append('phone', patientData.phone)

    const response = await apiClient.post<PatientConsultation>('/consultation/process-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    })
    return response.data
  },

  async getHistory(): Promise<PatientConsultation[]> {
    const response = await apiClient.get<PatientConsultation[]>('/consultation/history')
    return response.data
  },

  async getConsultationById(id: string): Promise<PatientConsultation> {
    const response = await apiClient.get<PatientConsultation>(`/consultation/${id}`)
    return response.data
  },

  async updateConsultation(
    id: string,
    data: { subjective?: string; objective?: string; assessment?: string; plan?: string }
  ): Promise<PatientConsultation> {
    const response = await apiClient.put<PatientConsultation>(`/consultation/${id}`, data)
    return response.data
  },

  async getAudio(id: string): Promise<string> {
    const cached = await getCachedAudio(id)
    if (cached) return URL.createObjectURL(cached)

    const response = await apiClient.get(`/consultation/${id}/audio`, {
      responseType: 'blob',
      timeout: 60000,
    })
    const blob: Blob = response.data
    void putCachedAudio(id, blob)
    return URL.createObjectURL(blob)
  },
}

export default consultationService
