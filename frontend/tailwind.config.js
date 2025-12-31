import { designTokens } from './src/theme/tokens';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Dark theme colors - critical for layout
    'bg-dark-950',
    'bg-dark-900',
    'bg-dark-800',
    'bg-dark-700',
    'text-gray-200',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'border-gray-800',
    'border-gray-700',
    'bg-dark-900/50',
    'bg-dark-800/50',
    // Primary colors
    'bg-primary-500',
    'text-primary-500',
    'border-primary-500',
    'focus:ring-primary-500',
    'focus:border-primary-500',
    // Status colors
    'bg-success',
    'bg-error',
    'bg-warning',
    'text-success',
    'text-error',
    'text-warning',
    // Utility patterns
    { pattern: /^bg-dark-/, variants: ['hover', 'focus'] },
    { pattern: /^text-gray-/, variants: ['hover', 'focus'] },
    { pattern: /^border-gray-/, variants: ['hover', 'focus'] },
    { pattern: /^text-primary-/, variants: ['hover', 'focus'] },
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
    forms,
    typography,
  ],
}
