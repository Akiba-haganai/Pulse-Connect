/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 This enables manual state triggers
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}