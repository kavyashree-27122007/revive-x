// ============================================================
// REVIVE X — Deterministic Decision Engine (AI Fallback)
// Generates rule-based decisions and template-driven explanations
// from actual transaction data. No hardcoded fake strings.
// ============================================================
import type { ITransaction } from '../models/Transaction.js';
import type { IMerchantPolicy } from '../models/MerchantPolicy.js';
import type {
  AIAnalysis,
  InterventionCandidate,
  InterventionType,
  LeakageType,
} from '@revive-x/shared';
import { calculateRecoveryProbability, calculateRiskScore } from './probabilityCalculator.js';
import { scoreInterventions } from './interventionScorer.js';
import { round2, formatINR } from '../utils/financial.js';

/**
 * Generate a leakage type for a transaction based on its status/data
 */
export function classifyLeakageType(tx: ITransaction): LeakageType {
  if (tx.paymentStatus === 'repeated_failure' || tx.retryCount >= 3) {
    return 'repeated_failure';
  }
  if (tx.paymentStatus === 'abandoned') {
    return 'checkout_abandonment';
  }
  if (tx.paymentStatus === 'subscription_failed') {
    return 'subscription_failure';
  }
  if (tx.paymentStatus === 'overdue') {
    return 'invoice_overdue';
  }
  if (tx.paymentStatus === 'failed' && tx.amount >= 10000) {
    return 'high_value_at_risk';
  }
  return 'payment_failure';
}

/**
 * Generate a concise, data-driven explanation for the selected intervention.
 * Never hardcoded — always references actual calculated values.
 */
export function generateExplanation(
  tx: ITransaction,
  selectedIntervention: InterventionType,
  candidates: InterventionCandidate[],
  _policy: IMerchantPolicy
): string {
  const selected = candidates.find((c) => c.type === selectedIntervention);
  if (!selected) return 'No compliant intervention found. Action set to STOP.';

  const customerSuccessRate =
    tx.customerHistory.totalTransactions > 0
      ? Math.round(
          (tx.customerHistory.successfulTransactions /
            tx.customerHistory.totalTransactions) *
            100
        )
      : 0;

  const parts: string[] = [];

  // Why this intervention?
  switch (selectedIntervention) {
    case 'immediate_retry':
      parts.push(
        `Immediate retry was selected because the failure reason ('${tx.failureReason ?? 'unknown'}') is typically transient.`
      );
      break;
    case 'delayed_retry':
      parts.push(
        `Delayed retry was selected because the transaction shows a temporary failure pattern and a brief delay improves recovery likelihood.`
      );
      break;
    case 'payment_reminder':
      parts.push(
        `A payment reminder was selected because this appears to be a checkout abandonment where the customer showed high intent (${tx.checkoutActivity.pagesViewed} pages viewed).`
      );
      break;
    case 'payment_link':
      parts.push(
        `A fresh payment link was selected to reduce checkout friction. The customer abandoned at the '${tx.checkoutActivity.abandonedAt ?? 'payment'}' stage.`
      );
      break;
    case 'personalized_message':
      parts.push(
        `A personalized recovery message was selected because the customer has a ${customerSuccessRate}% historical success rate and is likely to respond positively.`
      );
      break;
    case 'merchant_incentive':
      parts.push(
        `A merchant incentive (${selected.discountPct}% discount) was selected because it has the highest expected net recovery of ${formatINR(selected.expectedNetRecovery)} among policy-compliant options.`
      );
      break;
    case 'escalation':
      parts.push(
        `Escalation was selected because automated recovery strategies are exhausted or insufficient for this transaction value of ${formatINR(tx.amount)}.`
      );
      break;
    case 'stop':
      parts.push(
        `Recovery was stopped because no policy-compliant intervention can achieve the minimum expected net recovery.`
      );
      break;
  }

  // Recovery context
  parts.push(
    `Recovery probability: ${(tx.recoveryProbability * 100).toFixed(1)}%. ` +
    `Expected net recovery: ${formatINR(selected.expectedNetRecovery)}. ` +
    `Customer history: ${customerSuccessRate}% success rate across ${tx.customerHistory.totalTransactions} transactions.`
  );

  // Why this is the best option
  const ranked = [...candidates]
    .filter((c) => c.type !== 'stop')
    .sort((a, b) => b.expectedNetRecovery - a.expectedNetRecovery);

  if (ranked.length > 1 && ranked[0]?.type === selectedIntervention) {
    parts.push(
      `This strategy has the highest expected net recovery among all ${ranked.length} evaluated options.`
    );
  }

  return parts.join(' ');
}

/**
 * Full deterministic analysis of a single transaction
 */
export function analyzeTransactionDeterministic(
  tx: ITransaction,
  policy: IMerchantPolicy
): AIAnalysis {
  // Step 1: Classify leakage
  const leakageType = tx.leakageType ?? classifyLeakageType(tx);

  // Step 2: Calculate probability
  const recoveryProbability = calculateRecoveryProbability(tx);

  // Step 3: Risk score
  const riskScore = calculateRiskScore(tx);

  // Step 4: Score all interventions
  const discountPct = Math.min(5, policy.maximumDiscountPercentage);
  const candidates = scoreInterventions(tx, recoveryProbability, discountPct);

  // Step 5: Select best non-stop intervention
  const nonStopSorted = candidates
    .filter((c) => c.type !== 'stop')
    .sort((a, b) => b.finalScore - a.finalScore);

  const best = nonStopSorted[0];
  const selectedIntervention: InterventionType = best ? best.type : 'stop';

  // Step 6: Generate explanation from actual data
  const explanation = generateExplanation(tx, selectedIntervention, candidates, policy);

  return {
    transactionId: tx.transactionId,
    leakageType,
    riskScore: round2(riskScore),
    recoveryProbability,
    candidates,
    selectedIntervention,
    explanation,
    proposedBy: 'deterministic_engine',
  };
}
