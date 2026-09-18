/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#040610',
          900: '#060a14',
          800: '#0a0f1e',
          700: '#0f1628',
          600: '#151d35',
          500: '#1c2744',
        },
        cyber: {
          cyan: '#00f0ff',
          blue: '#0080ff',
          purple: '#8b5cf6',
          magenta: '#d946ef',
        },
        neon: {
          green: '#00ff88',
          yellow: '#ffd000',
          orange: '#ff6600',
          red: '#ff003c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.15), inset 0 0 15px rgba(0, 240, 255, 0.05)',
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.15)',
        'glow-red': '0 0 15px rgba(255, 0, 60, 0.2)',
        'glow-green': '0 0 15px rgba(0, 255, 136, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
