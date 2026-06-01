/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This forces Tailwind to look for the 'dark' class on the root element
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}