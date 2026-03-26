import useThemeStore from '../../stores/theme.store.js'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${className}`}
      title={isDark ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode'}
    >
      {/* Sun icon */}
      <svg
        className={`w-4 h-4 transition-all ${isDark ? 'text-gray-400' : 'text-yellow-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Toggle switch */}
      <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
        <div
          className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow-md transition-transform duration-300 ${
            isDark ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-[2px]'
          }`}
        />
      </div>

      {/* Moon icon */}
      <svg
        className={`w-4 h-4 transition-all ${isDark ? 'text-yellow-300' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  )
}
