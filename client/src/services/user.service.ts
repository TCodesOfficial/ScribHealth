import apiClient from '@/config/axios'
import type { User } from '@/types'

export interface UpdateProfilePayload {
  name?: string
  location?: string
}

const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/user/me')
    return response.data
  },

  async updateProfile(data: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.patch<User>('/user/me', data)
    return response.data
  },
}

export default userService
