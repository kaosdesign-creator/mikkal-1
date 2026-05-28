/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          cyan:   '#06b6d4',
          amber:  '#f59e0b',
          navy:   '#0f172a',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'typing':   'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        typing:  { '0%, 100%': { opacity: '0.3' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
