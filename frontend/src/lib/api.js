import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const inferredApiBaseUrl =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `https://focusflow-api-tzbl.onrender.com`
    : 'https://focusflow-api-tzbl.onrender.com'

const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? import.meta.env.VITE_API_URL || inferredApiBaseUrl
    : import.meta.env.VITE_API_URL || inferredApiBaseUrl

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
})

apiClient.interceptors.request.use(
  (config) => {
    const authHeader = useAuthStore.getState().getAuthHeader()
    if (authHeader.Authorization) {
      config.headers.Authorization = authHeader.Authorization
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
      })
    }
    return Promise.reject(error)
  }
)

export default apiClient
