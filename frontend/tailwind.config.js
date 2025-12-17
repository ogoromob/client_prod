import { designTokens } from './src/theme/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...designTokens.colors,
        // Keep the old brand colors for backward compatibility
        brand: {
          'bg-main': '#0a0e17',
          'bg-card': '#111827',
          'accent': '#00f5a0',
          'accent-secondary': '#00bcd4',
          'danger': '#ff3366',
          'text-primary': '#e2e8f0',
          'text-secondary': '#94a3b8',
          'border': '#1e293b',
        },
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      letterSpacing: designTokens.typography.letterSpacing,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      zIndex: designTokens.zIndex,
      animation: {
        'fade-in': `fadeIn ${designTokens.transitions.duration.normal} ${designTokens.transitions.timing['ease-in-out']}`,
        'slide-up': `slideUp ${designTokens.transitions.duration.slow} ${designTokens.transitions.timing['ease-out']}`,
        'slide-down': `slideDown ${designTokens.transitions.duration.normal} ${designTokens.transitions.timing['ease-out']}`,
        'scale-in': `scaleIn ${designTokens.transitions.duration.normal} ${designTokens.transitions.timing.spring}`,
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        ...designTokens.animations,
        // Additional custom keyframes
        glow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      transitionDuration: designTokens.transitions.duration,
      transitionTimingFunction: designTokens.transitions.timing,
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}