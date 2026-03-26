import { create } from 'zustand'

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('hatz_theme') || 'light',

  setTheme: (theme) => {
    localStorage.setItem('hatz_theme', theme)
    // Apply to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },

  toggleTheme: () => {
    const current = localStorage.getItem('hatz_theme') || 'light'
    const next = current === 'dark' ? 'light' : 'dark'
    localStorage.setItem('hatz_theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme: next })
  },

  // Call on app init to sync DOM with stored preference
  initTheme: () => {
    const stored = localStorage.getItem('hatz_theme') || 'light'
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme: stored })
  },
}))

export default useThemeStore
