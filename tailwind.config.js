/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {colors: {
        'tm-red': '#ED1C24',
        'tm-dark-blue': '#07233B',
        'tm-light-blue': '#00A3E0',
        'tm-gray-text': '#4B5563',
        'tm-light-gray-bg': '#F7F7F7',
        'tm-white': '#FFFFFF',
        'tm-border-gray': '#E5E7EB',
      },
    },
  },
  plugins: [],
}