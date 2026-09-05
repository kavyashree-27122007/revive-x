/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0F19',
          card: '#121826',
          border: '#1E293B',
          accent: '#3B82F6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}
