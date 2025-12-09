import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage } from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles very small numbers', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
    });
  });

  describe('formatPercentage', () => {
    it('formats positive percentages', () => {
      expect(formatPercentage(12.345)).toBe('+12.35%');
      expect(formatPercentage(100)).toBe('+100.00%');
    });

    it('formats negative percentages', () => {
      expect(formatPercentage(-5.67)).toBe('-5.67%');
    });

    it('handles zero', () => {
      expect(formatPercentage(0)).toBe('+0.00%');
    });
  });
});
