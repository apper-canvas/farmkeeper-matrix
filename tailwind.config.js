/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D5016',
          50: '#E8F5E8',
          100: '#D1EBD1',
          200: '#A3D7A3',
          300: '#75C375',
          400: '#47AF47',
          500: '#2D5016',
          600: '#244012',
          700: '#1B300E',
          800: '#122009',
          900: '#091005'
        },
        secondary: {
          DEFAULT: '#7CB342',
          50: '#F4F9EC',
          100: '#E9F3D9',
          200: '#D3E7B3',
          300: '#BDDB8D',
          400: '#A7CF67',
          500: '#7CB342',
          600: '#679235',
          700: '#4E6E28',
          800: '#344A1A',
          900: '#1A250D'
        },
        accent: {
          DEFAULT: '#FF6F00',
          50: '#FFF3E0',
          100: '#FFE7C1',
          200: '#FFCF83',
          300: '#FFB745',
          400: '#FF9F07',
          500: '#FF6F00',
          600: '#CC5900',
          700: '#994300',
          800: '#662D00',
          900: '#331600'
        },
        surface: '#F5F5DC',
        background: '#FAFAF8',
        success: '#43A047',
        warning: '#FB8C00',
        error: '#E53935',
        info: '#1976D2'
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }
        }
      }
    },
  },
  plugins: [],
}