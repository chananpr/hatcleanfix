import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.hatfixclean.com'

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('hatz_token') || null,
  user: (() => {
    try {
      const u = localStorage.getItem('hatz_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })(),
  isAuthenticated: !!localStorage.getItem('hatz_token'),

  login: async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    const { token, user } = res.data.data
    localStorage.setItem('hatz_token', token)
    localStorage.setItem('hatz_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
    return user
  },

  logout: () => {
    localStorage.removeItem('hatz_token')
    localStorage.removeItem('hatz_user')
    set({ token: null, user: null, isAuthenticated: false })
    window.location.href = '/login'
  },

  setUser: (user) => {
    localStorage.setItem('hatz_user', JSON.stringify(user))
    set({ user })
  },
}))

export default useAuthStore
