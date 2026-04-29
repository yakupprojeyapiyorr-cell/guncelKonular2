import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Add token to requests
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

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
