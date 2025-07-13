/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-delay': 'fadeIn 1s ease-out 0.3s both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.2',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(180deg)',
            opacity: '0.8',
          },
        },
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
          },
        },
      },
    },
  },
  plugins: [],
} 