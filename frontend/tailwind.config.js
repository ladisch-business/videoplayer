/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          border: '#333333',
          text: '#ffffff',
          'text-secondary': '#b3b3b3',
        }
      }
    },
  },
  plugins: [],
}
