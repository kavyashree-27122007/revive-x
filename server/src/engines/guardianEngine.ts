// ============================================================
// REVIVE X — Guardian Policy Engine
// Enforces merchant-defined policies on every AI decision.
// Must run before every intervention execution.
// ============================================================
import { hoursElapsed } from '../utils/financial.js';
import { CONTACT_INTERVENTIONS } from './interventionScorer.js';
import type { IMerchantPolicy } from '../models/MerchantPolicy.js';
import type { ITransaction } from '../models/Transaction.js';
import type {
  InterventionType,
  PolicyResult,
  InterventionCandidate,
  GuardianCheckResult,
} from '@revive-x/shared';

export interface GuardianContext {
  transaction: ITransaction;
  policy: IMerchantPolicy;
  proposedIntervention: InterventionType;
  proposedDiscountPct: number;
  contactAttemptsSoFar: number;
  allCandidates: InterventionCandidate[];
}

/**
 * Run the Guardian policy check on a proposed intervention.
 * Returns APPROVED, BLOCKED, ESCALATED, or STOPPED.
 * If BLOCKED, finds the next best compliant alternative.
 */
export function runGuardianCheck(ctx: GuardianContext): GuardianCheckResult {
  const {
    transaction: tx,
    policy,
    proposedIntervention,
    proposedDiscountPct,
    contactAttemptsSoFar,
    allCandidates,
  } = ctx;

  const violations: string[] = [];

  // ── Rule 1: Recovery window expired ───────────────────────
  const hoursAgo = hoursElapsed(
    tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp)
  );
  if (hoursAgo > policy.maximumRecoveryWindowHours) {
    return {
      result: 'stopped' as PolicyResult,
      violations: [
        `Recovery window of ${policy.maximumRecoveryWindowHours}h exceeded (${Math.round(hoursAgo)}h elapsed)`,
      ],
      reason: `Transaction is outside the ${policy.maximumRecoveryWindowHours}-hour recovery window.`,
      alternativeIntervention: null,
    };
  }

  // ── Rule 2: Recovery probability too low ───────────────────
  if (tx.recoveryProbability < policy.minimumRecoveryProbability) {
    return {
      result: 'stopped' as PolicyResult,
      violations: [
        `Recovery probability ${(tx.recoveryProbability * 100).toFixed(1)}% is below minimum ${(policy.minimumRecoveryProbability * 100).toFixed(1)}%`,
      ],
      reason: `Recovery probability is too low for autonomous action.`,
      alternativeIntervention: null,
    };
  }

  // ── Rule 3: Expected net recovery too low ──────────────────
  if (tx.expectedNetRecovery < policy.minimumExpectedNetRecovery) {
    return {
      result: 'stopped' as PolicyResult,
      violations: [
        `Expected net recovery ₹${tx.expectedNetRecovery.toFixed(0)} is below minimum ₹${policy.minimumExpectedNetRecovery.toFixed(0)}`,
      ],
      reason: `Expected net recovery is below the merchant-defined minimum. Recovery is uneconomical.`,
      alternativeIntervention: null,
    };
  }

  // ── Rule 4: High-value escalation ─────────────────────────
  if (
    policy.requireApprovalForHighValue &&
    tx.amount > policy.highValueEscalationThreshold
  ) {
    return {
      result: 'escalated' as PolicyResult,
      violations: [],
      reason: `Transaction amount ₹${tx.amount.toFixed(0)} exceeds autonomous threshold ₹${policy.highValueEscalationThreshold.toFixed(0)}. Requires merchant approval.`,
      alternativeIntervention: null,
    };
  }

  // ── Rule 5: Intervention type allowed ─────────────────────
  if (!policy.allowedInterventionTypes.includes(proposedIntervention)) {
    violations.push(`Intervention type '${proposedIntervention}' is not in the allowed list`);
  }

  // ── Rule 6: Retry limit ────────────────────────────────────
  if (
    (proposedIntervention === 'immediate_retry' || proposedIntervention === 'delayed_retry') &&
    tx.retryCount >= policy.maximumRetryAttempts
  ) {
    violations.push(
      `Retry limit reached: ${tx.retryCount}/${policy.maximumRetryAttempts} retries used`
    );
  }

  // ── Rule 7: Discount limit ─────────────────────────────────
  if (
    proposedIntervention === 'merchant_incentive' &&
    proposedDiscountPct > policy.maximumDiscountPercentage
  ) {
    violations.push(
      `Requested discount ${proposedDiscountPct}% exceeds maximum allowed ${policy.maximumDiscountPercentage}%`
    );
  }

  // ── Rule 8: Incentives allowed ─────────────────────────────
  if (proposedIntervention === 'merchant_incentive' && !policy.allowIncentives) {
    violations.push(`Merchant incentives are disabled by policy`);
  }

  // ── Rule 9: Contact attempt limit ─────────────────────────
  if (
    CONTACT_INTERVENTIONS.has(proposedIntervention) &&
    contactAttemptsSoFar >= policy.maximumContactAttempts
  ) {
    violations.push(
      `Contact limit reached: ${contactAttemptsSoFar}/${policy.maximumContactAttempts} contacts used`
    );
  }

  // ── If any violations → BLOCKED, find alternative ─────────
  if (violations.length > 0) {
    const alternative = findCompliantAlternative(
      allCandidates,
      proposedIntervention,
      policy,
      tx,
      contactAttemptsSoFar
    );

    return {
      result: 'blocked' as PolicyResult,
      violations,
      reason: buildBlockReason(violations),
      alternativeIntervention: alternative,
    };
  }

  return {
    result: 'approved' as PolicyResult,
    violations: [],
    reason: 'All policy constraints satisfied.',
    alternativeIntervention: null,
  };
}

/**
 * Find next-best compliant intervention when the primary is blocked
 */
function findCompliantAlternative(
  candidates: InterventionCandidate[],
  blocked: InterventionType,
  policy: IMerchantPolicy,
  tx: ITransaction,
  contactAttemptsSoFar: number
): InterventionType | null {
  // Sort by finalScore, skip the blocked type and 'stop'
  const sorted = [...candidates].sort((a, b) => b.finalScore - a.finalScore);

  for (const candidate of sorted) {
    if (candidate.type === blocked) continue;
    if (candidate.type === 'stop') continue;

    // Quick check: is this candidate compliant?
    if (!policy.allowedInterventionTypes.includes(candidate.type)) continue;

    if (
      (candidate.type === 'immediate_retry' || candidate.type === 'delayed_retry') &&
      tx.retryCount >= policy.maximumRetryAttempts
    ) continue;

    if (candidate.type === 'merchant_incentive' && !policy.allowIncentives) continue;

    if (
      CONTACT_INTERVENTIONS.has(candidate.type) &&
      contactAttemptsSoFar >= policy.maximumContactAttempts
    ) continue;

    return candidate.type;
  }

  return null; // No compliant alternative → STOP will be chosen
}

function buildBlockReason(violations: string[]): string {
  return `Action blocked by policy. Violations: ${violations.join('; ')}.`;
}
