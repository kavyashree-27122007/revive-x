// ============================================================
// Unit Tests: Financial Calculations & Safety
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  safeDiv,
  safeROI,
  recoveryRate,
  clamp,
  round2,
  formatINR,
  expectedRecovery,
  expectedNetRecovery,
} from '../utils/financial.js';

describe('Financial Utilities', () => {
  it('safeDiv should never return NaN or Infinity', () => {
    expect(safeDiv(100, 0)).toBe(0);
    expect(safeDiv(100, 0, 999)).toBe(999);
    expect(safeDiv(100, NaN)).toBe(0);
    expect(safeDiv(100, Infinity)).toBe(0);
    expect(safeDiv(100, 2)).toBe(50);
  });

  it('safeROI handles zero intervention cost safely by returning N/A', () => {
    expect(safeROI(5000, 0)).toBe('N/A');
    expect(safeROI(5000, 500)).toBe(10);
    expect(safeROI(0, 0)).toBe('N/A');
  });

  it('recoveryRate computes percentage and handles edge cases', () => {
    expect(recoveryRate(2000, 10000)).toBe(20);
    expect(recoveryRate(0, 10000)).toBe(0);
    expect(recoveryRate(5000, 0)).toBe(null);
  });

  it('clamp restricts value between min and max', () => {
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(-0.5, 0, 1)).toBe(0);
    expect(clamp(0.75, 0, 1)).toBe(0.75);
    expect(clamp(NaN, 0, 1)).toBe(0);
  });

  it('round2 rounds accurately to 2 decimal places', () => {
    expect(round2(12.3456)).toBe(12.35);
    expect(round2(10)).toBe(10);
    expect(round2(NaN)).toBe(0);
  });

  it('formatINR formats currency properly in Indian numbering format', () => {
    const formatted = formatINR(1240000);
    expect(formatted).toContain('12,40,000');
    expect(formatINR(NaN)).toBe('₹0');
  });

  it('expectedRecovery & expectedNetRecovery calculate safely', () => {
    expect(expectedRecovery(10000, 0.65)).toBe(6500);
    expect(expectedNetRecovery(10000, 0.65, 25)).toBe(6475);
    // Invalid inputs
    expect(expectedRecovery(-500, 0.5)).toBe(0);
    expect(expectedNetRecovery(1000, 0.5, -50)).toBe(500);
  });
});
