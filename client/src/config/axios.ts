import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'error' in body && body.error) {
      const errMessage = body.message || 'Request failed'
      return Promise.reject(Object.assign(new Error(errMessage), { serverMessage: errMessage, response }))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    const serverMessage = error.response?.data?.message || error.message
    return Promise.reject(Object.assign(error, { serverMessage }))
  },
)

export default apiClient
