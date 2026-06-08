import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API URL - Backend tunnel adresi (localtunnel üzerinden)
const API_URL = 'https://tangy-fans-appear.loca.lt/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Her isteğe JWT token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
      console.log(`[API Request] ${config.url} - Token Attached: YES (${token.substring(0, 10)}...)`);
    } else {
      console.log(`[API Request] ${config.url} - Token Attached: NO`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - sadece hataları ilet
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(`[API Error] ${error.config?.url} - Status: ${error.response?.status}`);
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };

