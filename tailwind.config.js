/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark palette
        'gotham': {
          'black': '#050608',
          'dark': '#0B0E14',
          'charcoal': '#151922',
          'graphite': '#1E2535',
          'muted': '#2A3245',
        },
        // Accent palette
        'batman': {
          'yellow': '#F5C518',
          'yellow-dim': '#C9A012',
          'yellow-glow': 'rgba(245, 197, 24, 0.15)',
        },
        'electric': {
          'blue': '#318BFF',
          'blue-dim': '#1A6BE0',
          'blue-glow': 'rgba(49, 139, 255, 0.12)',
        },
        'signal': {
          'red': '#E34D5B',
          'red-dim': '#C03344',
          'red-glow': 'rgba(227, 77, 91, 0.12)',
        },
        'jade': {
          'green': '#20C997',
          'green-dim': '#14A87E',
          'green-glow': 'rgba(32, 201, 151, 0.12)',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-yellow': 'pulse-yellow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-yellow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 90%, 100%': { opacity: 1 },
          '92%': { opacity: 0.6 },
          '94%': { opacity: 1 },
          '96%': { opacity: 0.7 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245, 197, 24, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(245, 197, 24, 0.5)' },
        },
        'typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'yellow': '0 0 20px rgba(245, 197, 24, 0.3)',
        'yellow-sm': '0 0 8px rgba(245, 197, 24, 0.2)',
        'blue': '0 0 20px rgba(49, 139, 255, 0.3)',
        'green': '0 0 20px rgba(32, 201, 151, 0.3)',
        'red': '0 0 20px rgba(227, 77, 91, 0.3)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.03)',
        'glass': '0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
