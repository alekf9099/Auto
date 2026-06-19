/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wood:  { DEFAULT: '#4CAF50', light: '#A5D6A7', dark: '#2E7D32' },
        fire:  { DEFAULT: '#F44336', light: '#FFCDD2', dark: '#B71C1C' },
        earth: { DEFAULT: '#FF9800', light: '#FFE0B2', dark: '#E65100' },
        metal: { DEFAULT: '#78909C', light: '#ECEFF1', dark: '#37474F' },
        water: { DEFAULT: '#2196F3', light: '#BBDEFB', dark: '#0D47A1' },
      },
      fontFamily: {
        korean: ['"Noto Serif KR"', 'serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease both',
      },
    },
  },
  plugins: [],
}
