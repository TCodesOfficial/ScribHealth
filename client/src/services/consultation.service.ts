import apiClient from '@/config/axios'
import type { PatientConsultation } from '@/types'

const consultationService = {
  async processAudio(file: File, patientIdentifier?: string): Promise<PatientConsultation> {
    const formData = new FormData()
    formData.append('file', file)

    const url = patientIdentifier
      ? `/consultation/process-audio?patientIdentifier=${encodeURIComponent(patientIdentifier)}`
      : '/consultation/process-audio'

    const response = await apiClient.post<PatientConsultation>(url, formData, {
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
}

export default consultationService
