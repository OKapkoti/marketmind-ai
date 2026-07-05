/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4f46e5',
          secondary: '#818cf8',
          accent: '#c7d2fe',
        }
      },
      backgroundColor: {
        'dark-surface': '#1e293b',
        'dark-bg': '#0f172a'
      }
    },
  },
  plugins: [],
}
