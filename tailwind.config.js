/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif']
      },
      colors: {
        cream: '#FAF6F1',
        paper: '#FFFDFA',
        ink: '#2B2A28',
        muted: '#7C7268',
        line: '#EAE3D8',
        terracotta: {
          DEFAULT: '#D87456',
          dark: '#B85E44',
          soft: '#F4D9CC'
        },
        sage: {
          DEFAULT: '#83A67A',
          dark: '#5E7D56',
          soft: '#DDE6D7'
        },
        mustard: '#D4A73C'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,42,40,0.04), 0 4px 16px -4px rgba(43,42,40,0.08)'
      }
    }
  },
  plugins: []
}
