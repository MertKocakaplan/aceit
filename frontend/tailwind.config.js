/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#7F021F',
          50: '#FFE5EA',
          100: '#FFCCD5',
          200: '#FF99AB',
          300: '#FF6681',
          400: '#FF3357',
          500: '#E6001F',
          600: '#B3001B',
          700: '#7F021F', // Main
          800: '#660118',
          900: '#4C0112',
          950: '#33000C',
        },
        // Secondary Accent Colors
        secondary: {
          DEFAULT: '#F5EBD0',
          50: '#FFFFFF',
          100: '#FEFDFB',
          200: '#FCF8ED',
          300: '#F9F3DF',
          400: '#F7EFD8',
          500: '#F5EBD0', // Main
          600: '#EBD6A3',
          700: '#E1C176',
          800: '#D7AC49',
          900: '#B88F2E',
        },
        // Neutral Tones for Balance
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        // Accent Colors for UI Elements
        accent: {
          gold: '#D4AF37',
          cream: '#FFF8E7',
          burgundy: '#5C0011',
          rose: '#8B4C5C',
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'system-ui', 'sans-serif'], // Main headings
        serif: ['Quicksand', 'system-ui', 'sans-serif'], // Content text
      },
      boxShadow: {
        'elegant': '0 4px 24px -2px rgba(127, 2, 31, 0.08)',
        'elegant-lg': '0 12px 48px -4px rgba(127, 2, 31, 0.12)',
        'elegant-xl': '0 20px 64px -8px rgba(127, 2, 31, 0.16)',
        'subtle': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
        'elegant-glow': 'elegantGlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        elegantGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
