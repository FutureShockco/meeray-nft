/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '.dark-theme'],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f6f5fa',
          '100': '#EDE8F5',
          '200': '#D6D6EB',
          '300': '#ADBBD4',
          '400': '#232B4A',
          '500': '#3D52A0',
          '600': '#7B8AC0',
          '700': '#7091E6',
          '800': '#5670B8',
          '900': '#0a0a0f',
        },
        secondary: {
          50: '#ffe6f9',
          100: '#ffb3ec',
          200: '#ff80df',
          300: '#ff4dd3',
          400: '#ff1acc',
          500: '#ff00c8', // var(--nft-neon-secondary)
          600: '#cc00a0',
          700: '#990078',
          800: '#660050',
          900: '#330028',
        },
       
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}; 
