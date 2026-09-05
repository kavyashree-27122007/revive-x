// ============================================================
// REVIVE X — Safe Financial Utilities
// All functions guard against NaN, Infinity, and undefined
// ============================================================

/**
 * Safe division — returns fallback if divisor is 0 or non-finite
 */
export function safeDiv(a: number, b: number): number;
export function safeDiv(a: number, b: number, fallback: number): number;
export function safeDiv(a: number, b: number, fallback: number = 0): number {
  if (!isFinite(b) || b === 0) return fallback;
  const result = a / b;
  return isFinite(result) ? result : fallback;
}

/**
 * Safe ROI — returns "N/A" string when cost is zero
 */
export function safeROI(netRecovered: number, cost: number): number | 'N/A' {
  if (cost === 0 || !isFinite(cost)) return 'N/A';
  const roi = safeDiv(netRecovered, cost);
  return isFinite(roi) ? roi : 'N/A';
}

/**
 * Recovery rate as percentage (0-100), null if no risk
 */
export function recoveryRate(recovered: number, atRisk: number): number | null {
  if (atRisk <= 0) return null;
  const rate = safeDiv(recovered * 100, atRisk);
  return clamp(rate, 0, 100);
}

/**
 * Clamp a number to [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to 2 decimal places safely
 */
export function round2(value: number): number {
  if (!isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/**
 * Format as INR string — e.g. ₹12,40,000
 */
export function formatINR(amount: number): string {
  if (!isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Ensure a number is a valid non-negative financial value
 */
export function sanitizeAmount(value: unknown): number {
  const n = Number(value);
  if (!isFinite(n) || n < 0) return 0;
  return round2(n);
}

/**
 * Hours elapsed since a given timestamp
 */
export function hoursElapsed(timestamp: Date): number {
  const msElapsed = Date.now() - timestamp.getTime();
  const hours = msElapsed / (1000 * 60 * 60);
  return Math.max(0, hours);
}

/**
 * Calculate expected recovery amount
 */
export function expectedRecovery(amount: number, probability: number): number {
  return round2(sanitizeAmount(amount) * clamp(probability, 0, 1));
}

/**
 * Calculate expected net recovery
 */
export function expectedNetRecovery(
  amount: number,
  probability: number,
  cost: number
): number {
  return round2(expectedRecovery(amount, probability) - sanitizeAmount(cost));
}
