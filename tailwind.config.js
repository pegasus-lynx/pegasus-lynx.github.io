/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./_site/**/*.{html,js}", "./_site/project/*"],
  theme: {
    extend: {
      fontFamily: {
        ibmplex: ["'IBM Plex Sans'", "sans-serif"],
        opensans: ["'Open Sans'", "sans-serif"],
      },
      fontSize: {
        '6xl': '4rem',
      },
      width: {
        '9/20': '45%',
      },
      boxShadow: {
        't-sm': '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
        't-md': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        't-lg': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        't-xl': '0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        't-2xl': '0 -25px 50px -12px rgba(0, 0, 0, 0.25)',
        't-3xl': '0 -35px 60px -15px rgba(0, 0, 0, 0.3)',
        '2xl-dark': '0 20px 50px 12px rgba(107, 114, 128, 0.3)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}

