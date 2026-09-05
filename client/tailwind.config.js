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
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          sidebar: '#090D16',
          navy: '#0F172A',
          navyMuted: '#1E293B',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#06B6D4',
          cyan: '#06B6D4',
          cyanDark: '#0891B2',
          cyanLight: '#ECFEFF',
          violet: '#7C3AED',
          violetLight: '#F5F3FF',
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
