// ============================================================
// REVIVE X — Recovery Probability Calculator
// Deterministic, seeded, factor-weighted scoring
// ============================================================
import { clamp, hoursElapsed } from '../utils/financial.js';
import type { ITransaction } from '../models/Transaction.js';

/**
 * Failure reason categories → recovery likelihood
 */
const FAILURE_REASON_SCORES: Record<string, number> = {
  // Temporary / retriable
  insufficient_funds: 0.55,
  network_timeout: 0.85,
  bank_timeout: 0.80,
  gateway_timeout: 0.82,
  do_not_honour: 0.40,
  card_declined_temporary: 0.60,
  authentication_failed: 0.65,
  three_d_secure_failed: 0.62,
  // Permanent / hard declines
  card_expired: 0.20,
  card_blocked: 0.15,
  fraud_detected: 0.05,
  stolen_card: 0.03,
  invalid_card: 0.10,
  account_closed: 0.08,
  // Checkout/subscription
  checkout_abandoned: 0.70,
  subscription_cancelled: 0.25,
  subscription_paused: 0.50,
  invoice_unpaid: 0.55,
};

function getFailureReasonScore(failureReason: string | null): number {
  if (!failureReason) return 0.50; // unknown — neutral
  const normalized = failureReason.toLowerCase().replace(/\s+/g, '_');
  return FAILURE_REASON_SCORES[normalized] ?? 0.45;
}

function getLeakageTypeBaseScore(leakageType: string | null): number {
  switch (leakageType) {
    case 'checkout_abandonment': return 0.72;
    case 'payment_failure': return 0.58;
    case 'subscription_failure': return 0.52;
    case 'invoice_overdue': return 0.50;
    case 'repeated_failure': return 0.30;
    case 'high_value_at_risk': return 0.45;
    default: return 0.50;
  }
}

function getAgeDecayScore(timestampDate: Date): number {
  const hours = hoursElapsed(timestampDate);
  if (hours <= 1) return 1.0;
  if (hours <= 6) return 0.92;
  if (hours <= 24) return 0.80;
  if (hours <= 48) return 0.65;
  if (hours <= 72) return 0.45;
  if (hours <= 168) return 0.30; // 1 week
  return 0.15;
}

function getRetryPenalty(retryCount: number): number {
  if (retryCount === 0) return 1.0;
  if (retryCount === 1) return 0.75;
  if (retryCount === 2) return 0.55;
  if (retryCount === 3) return 0.35;
  return 0.15; // 4+
}

function getCustomerHistoryScore(tx: ITransaction): number {
  const { totalTransactions, successfulTransactions } = tx.customerHistory;
  if (totalTransactions === 0) return 0.50;
  const successRate = successfulTransactions / totalTransactions;
  // Weight: higher success rate → better recovery chance
  // Also consider total transaction count (loyal customer)
  const loyaltyBoost = Math.min(totalTransactions / 20, 1) * 0.1;
  return clamp(successRate + loyaltyBoost, 0, 1);
}

/**
 * Calculate recovery probability (0-1) for a transaction.
 * Uses weighted combination of 5 deterministic factors.
 * Result is deterministic for the same transaction data.
 */
export function calculateRecoveryProbability(tx: ITransaction): number {
  // Factor weights (must sum to 1.0)
  const W_CUSTOMER_HISTORY = 0.30;
  const W_FAILURE_REASON = 0.25;
  const W_RETRY_PENALTY = 0.20;
  const W_AGE_DECAY = 0.15;
  const W_LEAKAGE_TYPE = 0.10;

  const customerHistoryScore = getCustomerHistoryScore(tx);
  const failureReasonScore = getFailureReasonScore(tx.failureReason);
  const retryPenalty = getRetryPenalty(tx.retryCount);
  const ageDecay = getAgeDecayScore(tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp));
  const leakageTypeScore = getLeakageTypeBaseScore(tx.leakageType);

  const raw =
    customerHistoryScore * W_CUSTOMER_HISTORY +
    failureReasonScore * W_FAILURE_REASON +
    retryPenalty * W_RETRY_PENALTY +
    ageDecay * W_AGE_DECAY +
    leakageTypeScore * W_LEAKAGE_TYPE;

  return clamp(Math.round(raw * 1000) / 1000, 0, 1);
}

/**
 * Calculate risk score (0-100) — inverse of recovery ease
 * High risk = transaction is likely to be lost permanently
 */
export function calculateRiskScore(tx: ITransaction): number {
  const recoveryProb = calculateRecoveryProbability(tx);
  const amountFactor = Math.min(tx.amount / 50000, 1) * 20; // High amounts increase risk
  const retryFactor = Math.min(tx.retryCount * 10, 30);

  // Higher amount + lower recovery + more retries = higher risk
  const base = (1 - recoveryProb) * 50 + amountFactor + retryFactor;
  return clamp(Math.round(base), 0, 100);
}

export function getRiskLevel(riskScore: number): 'high' | 'medium' | 'low' {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}
