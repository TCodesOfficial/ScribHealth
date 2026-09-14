import apiClient from '@/config/axios'

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  email: string
  password: string
  name: string
  location?: string
}

const authService = {
  async signIn(data: SignInPayload) {
    const response = await apiClient.post('/auth/sign-in/email', data)
    return response.data
  },

  async signUp(data: SignUpPayload) {
    const response = await apiClient.post('/auth/sign-up/email', data)
    return response.data
  },

  async signOut() {
    const response = await apiClient.post('/auth/sign-out')
    return response.data
  },

  async getSession() {
    const response = await apiClient.get('/auth/get-session')
    return response.data
  },
}

export default authService
