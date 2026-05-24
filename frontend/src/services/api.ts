import axios from 'axios'
import { API_BASE_URL } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: API_BASE_URL
})

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  if (session?.user?.email) {
    config.headers['x-demo-email'] = session.user.email
  }
  return config
})
