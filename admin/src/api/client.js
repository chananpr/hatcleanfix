import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.hatfixclean.com'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hatz_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hatz_token')
      localStorage.removeItem('hatz_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
