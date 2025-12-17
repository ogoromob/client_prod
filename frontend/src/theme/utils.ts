// src/theme/utils.ts
/**
 * Theme utility functions
 * Helper functions to work with design tokens
 */

import { designTokens } from './tokens';

/**
 * Get color value from token path
 * @example getColor('primary.500') => '#0ea5e9'
 */
export function getColor(path: string): string {
  const parts = path.split('.');
  let value: any = designTokens.colors;
  
  for (const part of parts) {
    value = value[part];
    if (!value) return path; // Return original if not found
  }
  
  return typeof value === 'string' ? value : path;
}

/**
 * Get spacing value from token
 * @example getSpacing(4) => '1rem'
 */
export function getSpacing(token: number | string): string {
  return designTokens.spacing[token as keyof typeof designTokens.spacing] || `${token}px`;
}

/**
 * Get shadow value from token
 * @example getShadow('lg') => '0 10px 15px...'
 */
export function getShadow(token: keyof typeof designTokens.shadows): string {
  return designTokens.shadows[token];
}

/**
 * Create responsive styles
 * @example responsive({ sm: 'text-sm', md: 'text-base', lg: 'text-lg' })
 */
export function responsive(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([breakpoint, style]) => {
      if (breakpoint === 'base') return style;
      return `${breakpoint}:${style}`;
    })
    .join(' ');
}

/**
 * Create transition CSS
 * @example transition(['opacity', 'transform']) => 'transition: opacity 250ms ease, transform 250ms ease'
 */
export function transition(
  properties: string[],
  duration: keyof typeof designTokens.transitions.duration = 'normal',
  timing: keyof typeof designTokens.transitions.timing = 'ease'
): string {
  const durationValue = designTokens.transitions.duration[duration];
  const timingValue = designTokens.transitions.timing[timing];
  
  return properties
    .map(prop => `${prop} ${durationValue} ${timingValue}`)
    .join(', ');
}

/**
 * Get gradient background
 * @example gradient('primary', 'secondary') => 'linear-gradient(...)'
 */
export function gradient(from: string, to: string, direction = 'to right'): string {
  const fromColor = getColor(from);
  const toColor = getColor(to);
  return `linear-gradient(${direction}, ${fromColor}, ${toColor})`;
}

/**
 * Create glass morphism effect
 */
export function glassMorphism(opacity = 0.1): React.CSSProperties {
  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: designTokens.shadows.glass,
  };
}

/**
 * Create dark glass morphism effect
 */
export function darkGlassMorphism(opacity = 0.1): React.CSSProperties {
  return {
    background: `rgba(15, 23, 42, ${opacity})`,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: designTokens.shadows.glass,
  };
}

/**
 * Get color based on value (profit/loss)
 * @example getValueColor(10.5) => '#10b981' (green for profit)
 */
export function getValueColor(value: number): string {
  if (value > 0) return designTokens.colors.trading.profit;
  if (value < 0) return designTokens.colors.trading.loss;
  return designTokens.colors.trading.neutral;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: designTokens.colors.success.DEFAULT,
    upcoming: designTokens.colors.info.DEFAULT,
    closed: designTokens.colors.dark[500],
    paused: designTokens.colors.warning.DEFAULT,
    settling: designTokens.colors.secondary[500],
    approved: designTokens.colors.success.DEFAULT,
    pending: designTokens.colors.warning.DEFAULT,
    rejected: designTokens.colors.error.DEFAULT,
  };
  
  return statusColors[status.toLowerCase()] || designTokens.colors.dark[500];
}

/**
 * Format currency with color
 */
export function formatCurrencyWithColor(value: number): { text: string; color: string } {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Math.abs(value));
  
  return {
    text: value < 0 ? `-${formatted}` : formatted,
    color: getValueColor(value),
  };
}

/**
 * Format percentage with color
 */
export function formatPercentageWithColor(value: number): { text: string; color: string } {
  return {
    text: `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
    color: getValueColor(value),
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Get media query string
 */
export function mediaQuery(breakpoint: keyof typeof designTokens.breakpoints): string {
  return `@media (min-width: ${designTokens.breakpoints[breakpoint]})`;
}

/**
 * Create animation keyframes
 */
export function createAnimation(name: string, keyframes: Record<string, React.CSSProperties>): string {
  const keyframeString = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => {
          const cssProperty = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `${cssProperty}: ${value};`;
        })
        .join(' ');
      return `${key} { ${styleString} }`;
    })
    .join('\n');
    
  return `@keyframes ${name} {\n${keyframeString}\n}`;
}

/**
 * Get contrast color (black or white) based on background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Darken a color by percentage
 */
export function darken(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - percent / 100));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - percent / 100));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - percent / 100));
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Lighten a color by percentage
 */
export function lighten(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 - parseInt(hex.substr(0, 2), 16)) * (percent / 100));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 - parseInt(hex.substr(2, 2), 16)) * (percent / 100));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 - parseInt(hex.substr(4, 2), 16)) * (percent / 100));
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

// Export all utilities
export const themeUtils = {
  getColor,
  getSpacing,
  getShadow,
  responsive,
  transition,
  gradient,
  glassMorphism,
  darkGlassMorphism,
  getValueColor,
  getStatusColor,
  formatCurrencyWithColor,
  formatPercentageWithColor,
  clamp,
  lerp,
  mediaQuery,
  createAnimation,
  getContrastColor,
  darken,
  lighten,
};
