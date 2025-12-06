/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#16A34A",
        secondary: "#1F2937",
        accent: "#DCFCE7",
      },
    },
  },
  plugins: [],
}
