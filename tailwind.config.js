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
          '200': '#00ffea',
          '300': '#ff00c8',
          '400': '#6a0dad',
          '500': '#2a0a50',
          '600': '#2f2f6eff',
          '700': '#202049ff',
          '800': '#151530',
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
