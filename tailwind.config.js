/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy palette — dominant brand colour
        navy: {
          950: '#050B1A',
          900: '#0A1628',
          850: '#0D1B33',
          800: '#0F1F3D',
          700: '#142849',
          600: '#1B3358',
          500: '#234070',
          400: '#345088',
          300: '#5673A8',
        },
        // Electric blue — primary accent
        accent: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Cyan — secondary accent for highlights
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        // Status palette
        ok: '#10B981',
        warn: '#F59E0B',
        risk: '#EF4444',
        info: '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 32px -8px rgba(59, 130, 246, 0.45)',
        'glow-cyan': '0 0 32px -8px rgba(6, 182, 212, 0.5)',
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 1px 2px 0 rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(180deg, #0A1628 0%, #050B1A 100%)',
        'panel-gradient': 'linear-gradient(180deg, rgba(20,40,73,0.6) 0%, rgba(15,31,61,0.4) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
      },
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
