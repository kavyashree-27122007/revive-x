// ============================================================
// REVIVE X — Intervention Scorer
// Evaluates all 8 strategy candidates and ranks by expected net recovery
// ============================================================
import { clamp, round2, expectedRecovery, expectedNetRecovery } from '../utils/financial.js';
import { INTERVENTION_COSTS } from '@revive-x/shared';
import type { InterventionType, InterventionCandidate } from '@revive-x/shared';
import type { ITransaction } from '../models/Transaction.js';

/**
 * Recovery probability modifier per intervention type.
 * Applies a multiplier to the base recovery probability.
 */
const INTERVENTION_PROBABILITY_MODIFIER: Record<InterventionType, number> = {
  immediate_retry: 0.85,         // Quick retry — works well for temp failures
  delayed_retry: 1.05,           // Slightly better — gives time for issue resolution
  payment_reminder: 0.90,        // Reminder — effective for checkout abandonment
  payment_link: 0.95,            // Fresh link — removes friction
  personalized_message: 1.00,    // Tailored outreach — good for loyal customers
  merchant_incentive: 1.20,      // Incentive — highest conversion boost
  escalation: 0.60,              // Human escalation — slower, moderate success
  stop: 0.00,                    // No recovery attempted
};

/**
 * Annoyance risk per intervention type (0-1)
 * Higher = more likely to frustrate the customer
 */
const ANNOYANCE_RISK: Record<InterventionType, number> = {
  immediate_retry: 0.1,
  delayed_retry: 0.1,
  payment_reminder: 0.4,
  payment_link: 0.3,
  personalized_message: 0.5,
  merchant_incentive: 0.2,
  escalation: 0.7,
  stop: 0.0,
};

/**
 * Contact-based interventions (track against maximumContactAttempts)
 */
export const CONTACT_INTERVENTIONS: Set<InterventionType> = new Set([
  'payment_reminder',
  'personalized_message',
  'payment_link',
  'escalation',
]);

/**
 * Calculate intervention cost in INR
 * For merchant_incentive: cost = discountPct% of expected recovery
 */
function calculateCost(
  type: InterventionType,
  amount: number,
  recoveryProb: number,
  discountPct: number
): number {
  if (type === 'merchant_incentive') {
    const recovAmt = expectedRecovery(amount, recoveryProb);
    return round2((discountPct / 100) * recovAmt);
  }
  return INTERVENTION_COSTS[type];
}

/**
 * Score all 8 intervention candidates for a transaction.
 * Returns sorted list (highest finalScore first).
 */
export function scoreInterventions(
  tx: ITransaction,
  baseRecoveryProbability: number,
  discountPct: number = 5  // default 5% for merchant_incentive
): InterventionCandidate[] {
  const candidates: InterventionCandidate[] = [];

  const INTERVENTION_TYPES: InterventionType[] = [
    'immediate_retry',
    'delayed_retry',
    'payment_reminder',
    'payment_link',
    'personalized_message',
    'merchant_incentive',
    'escalation',
    'stop',
  ];

  for (const type of INTERVENTION_TYPES) {
    const modifier = INTERVENTION_PROBABILITY_MODIFIER[type];
    const adjProbability = clamp(baseRecoveryProbability * modifier, 0, 1);

    const expRecovery = expectedRecovery(tx.amount, adjProbability);
    const cost = calculateCost(type, tx.amount, adjProbability, discountPct);
    const expNetRecovery = expectedNetRecovery(tx.amount, adjProbability, cost);
    const annoyanceRisk = ANNOYANCE_RISK[type];

    // Final score = net recovery minus annoyance penalty
    const annoyancePenalty = annoyanceRisk * tx.amount * 0.02;
    const finalScore = round2(expNetRecovery - annoyancePenalty);

    candidates.push({
      type,
      recoveryProbability: adjProbability,
      expectedRecovery: expRecovery,
      interventionCost: cost,
      expectedNetRecovery: expNetRecovery,
      customerAnnoyanceRisk: annoyanceRisk,
      policyRisk: 0,   // Will be set by Guardian
      finalScore,
      discountPct: type === 'merchant_incentive' ? discountPct : 0,
    });
  }

  // Sort by finalScore descending (stop goes last unless it's the best option)
  return candidates.sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Select the best intervention from policy-approved candidates.
 * Returns null if no valid candidates remain (will result in STOP).
 */
export function selectBestIntervention(
  candidates: InterventionCandidate[]
): InterventionCandidate | null {
  // Filter out 'stop' for now — it's chosen only if nothing else qualifies
  const nonStopCandidates = candidates.filter((c) => c.type !== 'stop');
  if (nonStopCandidates.length === 0) return null;
  return nonStopCandidates[0] ?? null;
}
