/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Luxury black / dark grey canvas
        ink: {
          950: '#060607',
          900: '#0A0A0C',
          850: '#0E0E11',
          800: '#131317',
          750: '#17171C',
          700: '#1C1C22',
          600: '#26262E',
          500: '#33333D',
          400: '#4A4A57',
          300: '#6B6B7B',
          200: '#9A9AA8',
          100: '#C9C9D2',
          50: '#EDEDF1',
        },
        // Signature gold
        gold: {
          50: '#FDF8E9',
          100: '#FAEFC8',
          200: '#F5DF96',
          300: '#EFCE64',
          400: '#E5BC45',
          500: '#D4AF37',
          600: '#B8942A',
          700: '#8F711F',
          800: '#665018',
          900: '#3D3010',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(212,175,55,0.18), 0 12px 40px -12px rgba(212,175,55,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -24px rgba(0,0,0,0.9)',
        lift: '0 24px 60px -28px rgba(0,0,0,0.95)',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg,#F5DF96 0%,#D4AF37 45%,#8F711F 100%)',
        'gold-text': 'linear-gradient(120deg,#FDF8E9 0%,#EFCE64 35%,#D4AF37 60%,#8F711F 100%)',
        'ink-radial': 'radial-gradient(120% 120% at 50% 0%, #17171C 0%, #0A0A0C 55%, #060607 100%)',
        'grid-fade': 'linear-gradient(to right, rgba(212,175,55,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,175,55,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.35)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,175,55,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .35s ease both',
        'fade-up': 'fade-up .45s cubic-bezier(.22,1,.36,1) both',
        'scale-in': 'scale-in .25s cubic-bezier(.22,1,.36,1) both',
        'slide-in-right': 'slide-in-right .3s cubic-bezier(.22,1,.36,1) both',
        'slide-up': 'slide-up .32s cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 2.4s linear infinite',
        'pulse-gold': 'pulse-gold 2.2s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
};
