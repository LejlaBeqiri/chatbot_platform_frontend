import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://chatbot_platform.test',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Helper function to check admin role
export const requireAdmin = () => {
  const authStore = useAuthStore()
  if (authStore.user?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
}

api.interceptors.request.use(
  (config) => {
    // Check for admin routes
    if (config.url?.startsWith('/api/admin')) {
      requireAdmin()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
    }

    return Promise.reject(error)
  }
)

export { api }