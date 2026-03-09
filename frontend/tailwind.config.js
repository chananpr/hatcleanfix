/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-red': '#FF0000',
        'brand-yellow': '#FFCC00',
        'brand-black': '#1A1A1A',
      },
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 30px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeInUp 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
