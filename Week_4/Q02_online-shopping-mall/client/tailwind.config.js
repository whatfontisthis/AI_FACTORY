/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coupang: {
          blue: '#346aff',
          red: '#e52528',
          dark: '#111111',
          gray: '#999999',
          light: '#f5f5f5',
          rocket: '#00bfff',
        },
      },
    },
  },
  plugins: [],
};
