/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#7c6af7', dark: '#6554e0', light: '#a89cf9' },
        surface: { DEFAULT: '#0f0f0f', 1: '#161616', 2: '#1e1e1e', 3: '#2a2a2a' },
      },
    },
  },
  plugins: [],
};
