// src/theme/index.ts
/**
 * Design System - Central Export
 * Import everything you need from a single place
 */

export * from './tokens';
export * from './utils';
export { colors } from './colors';

// Re-export specific utilities for convenience
export {
  getColor,
  getSpacing,
  getShadow,
  glassMorphism,
  darkGlassMorphism,
  getValueColor,
  getStatusColor,
  formatCurrencyWithColor,
  formatPercentageWithColor,
} from './utils';
