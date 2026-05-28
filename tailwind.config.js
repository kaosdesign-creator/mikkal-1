/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    '#0D0F1A',
          cyan:    '#00E5FF',
          charcoal:'#1A1D2E',
          white:   '#F0F0F0',
          amber:   '#FFB300',
          surface: '#12141F',
          border:  '#2A2D3E',
          muted:   '#4A4D5E',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mikkal-glow': 'radial-gradient(ellipse at top, #00E5FF15 0%, #0D0F1A 70%)',
        'mikkal-warm': 'radial-gradient(ellipse at center, #FFB30010 0%, #0D0F1A 70%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.8s ease forwards',
        'slide-up':   'slideUp 0.6s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing':     'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px #00E5FF30' },
          '50%':      { boxShadow: '0 0 40px #00E5FF60' },
        },
        typing: {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
