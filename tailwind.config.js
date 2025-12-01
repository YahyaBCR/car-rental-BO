/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        primaryDark: '#E85A2A',
        secondary: '#004E89',
        accent: '#F77F00',
        success: '#06D6A0',
        warning: '#FFD60A',
        error: '#EF476F',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        textPrimary: '#2D3748',
        textSecondary: '#718096',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
