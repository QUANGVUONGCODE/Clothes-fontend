/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f6f6',
          100: '#ececec',
          200: '#dcdcdc',
          300: '#c0c0c0',
          400: '#a4a4a4',
          500: '#8a8a8a',
          600: '#6f6f6f',
          700: '#5a5a5a',
          800: '#3f3f3f',
          900: '#1e1e1e'
        },
        accent: '#8b5e3c',
        success: '#1f7a50',
        danger: '#c53b32'
      },
      boxShadow: {
        soft: '0 10px 35px rgba(0,0,0,0.08)',
        card: '0 8px 24px rgba(15, 15, 15, 0.08)'
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          lg: '2rem',
          xl: '3rem'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
};
