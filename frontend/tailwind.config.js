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
        chat: {
          light: {
            bg: '#F9FAFB',
            primary: '#3B82F6',
            secondary: '#F3F4F6',
            bubbleSelf: '#DBEAFE',
            bubbleOther: '#FFFFFF',
            text: '#111827',
            muted: '#4B5563',
            accent: '#06B6D4'
          },
          dark: {
            bg: '#0F172A',
            primary: '#3B82F6',
            secondary: '#1E293B',
            bubbleSelf: '#1E3A8A',
            bubbleOther: '#1E293B',
            text: '#F8FAFC',
            muted: '#94A3B8',
            accent: '#06B6D4'
          }
        }
      }
    },
  },
  plugins: [],
}