import apiClient from '@/config/axios'
import type { Patient } from '@/types'

const patientService = {
  async getPatients(): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/patient')
    return response.data
  },

  async getPatientById(id: string): Promise<Patient & { consultations: import('@/types').PatientConsultation[] }> {
    const response = await apiClient.get<Patient & { consultations: import('@/types').PatientConsultation[] }>(`/patient/${id}`)
    return response.data
  },

  async searchPatients(query: string): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/patient/search', { params: { q: query } })
    return response.data
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await apiClient.put<Patient>(`/patient/${id}`, data)
    return response.data
  },

  async deletePatient(id: string): Promise<{ id: string; deleted: boolean }> {
    const response = await apiClient.delete<{ id: string; deleted: boolean }>(`/patient/${id}`)
    return response.data
  },
}

export default patientService
