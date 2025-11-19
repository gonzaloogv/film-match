/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',    // iPhone SE y superiores (mobile-first)
      'sm': '640px',    // Móviles grandes / tablets pequeños
      'md': '768px',    // Tablets
      'lg': '1024px',   // Desktop pequeño
      'xl': '1280px',   // Desktop estándar
      '2xl': '1536px',  // Desktop grande
      '3xl': '1920px',  // Full HD y monitores grandes
      '4xl': '2560px',  // 4K y monitores ultra-anchos
    },
    extend: {
      colors: {
        primary: {
          pink: '#ff005a',
          purple: '#9c27ff',
        },
        dark: {
          bg: '#0e0e11',
          card: '#1a1a1f',
          input: '#25252d',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff005a 0%, #9c27ff 100%)',
        'gradient-match': 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
      },
      maxWidth: {
        'xs': '20rem',      // 320px
        '8xl': '90rem',     // 1440px
        '9xl': '120rem',    // 1920px
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      }
    },
  },
  plugins: [],
}
