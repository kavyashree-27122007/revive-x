// ============================================================
// Unit Tests: Guardian Policy Engine & Policy Change Verification
// ============================================================
import { describe, it, expect } from 'vitest';
import { runGuardianCheck } from '../engines/guardianEngine.js';
import { scoreInterventions } from '../engines/interventionScorer.js';
import { DEFAULT_POLICY } from '@revive-x/shared';

describe('Guardian Policy Engine', () => {
  const mockTx: any = {
    transactionId: 'TXN-TEST-001',
    amount: 5000,
    timestamp: new Date(),
    retryCount: 1,
    recoveryProbability: 0.70,
    expectedNetRecovery: 3500,
    leakageType: 'payment_failure',
    customerHistory: { totalTransactions: 5, successfulTransactions: 4 },
  };

  it('approves compliant intervention within all thresholds', () => {
    const policy: any = { ...DEFAULT_POLICY };
    const candidates = scoreInterventions(mockTx, 0.70);

    const result = runGuardianCheck({
      transaction: mockTx,
      policy,
      proposedIntervention: 'delayed_retry',
      proposedDiscountPct: 0,
      contactAttemptsSoFar: 1,
      allCandidates: candidates,
    });

    expect(result.result).toBe('approved');
    expect(result.violations.length).toBe(0);
  });

  it('blocks when proposed discount exceeds policy maximum discount', () => {
    const policy: any = { ...DEFAULT_POLICY, maximumDiscountPercentage: 10 };
    const candidates = scoreInterventions(mockTx, 0.70);

    const result = runGuardianCheck({
      transaction: mockTx,
      policy,
      proposedIntervention: 'merchant_incentive',
      proposedDiscountPct: 25, // Requested 25% > Allowed 10%
      contactAttemptsSoFar: 1,
      allCandidates: candidates,
    });

    expect(result.result).toBe('blocked');
    expect(result.violations[0]).toContain('exceeds maximum allowed 10%');
    expect(result.alternativeIntervention).not.toBeNull();
    expect(result.alternativeIntervention).not.toBe('merchant_incentive');
  });

  it('VERIFICATION: Changing policy from 10% to 30% discount unblocks 25% incentive', () => {
    // 1. Strict Policy (10% max)
    const strictPolicy: any = { ...DEFAULT_POLICY, maximumDiscountPercentage: 10 };
    const candidates = scoreInterventions(mockTx, 0.70);

    const strictResult = runGuardianCheck({
      transaction: mockTx,
      policy: strictPolicy,
      proposedIntervention: 'merchant_incentive',
      proposedDiscountPct: 25,
      contactAttemptsSoFar: 1,
      allCandidates: candidates,
    });
    expect(strictResult.result).toBe('blocked');

    // 2. Relaxed Policy (30% max)
    const relaxedPolicy: any = { ...DEFAULT_POLICY, maximumDiscountPercentage: 30 };
    const relaxedResult = runGuardianCheck({
      transaction: mockTx,
      policy: relaxedPolicy,
      proposedIntervention: 'merchant_incentive',
      proposedDiscountPct: 25,
      contactAttemptsSoFar: 1,
      allCandidates: candidates,
    });
    // Now it must be APPROVED!
    expect(relaxedResult.result).toBe('approved');
    expect(relaxedResult.violations.length).toBe(0);
  });

  it('blocks retries when retryCount exceeds maximumRetryAttempts', () => {
    const highRetryTx = { ...mockTx, retryCount: 3 };
    const policy: any = { ...DEFAULT_POLICY, maximumRetryAttempts: 2 };
    const candidates = scoreInterventions(highRetryTx, 0.50);

    const result = runGuardianCheck({
      transaction: highRetryTx,
      policy,
      proposedIntervention: 'immediate_retry',
      proposedDiscountPct: 0,
      contactAttemptsSoFar: 3,
      allCandidates: candidates,
    });

    expect(result.result).toBe('blocked');
    expect(result.violations[0]).toContain('Retry limit reached');
  });

  it('escalates high-value transactions when exceeding autonomous threshold', () => {
    const highValueTx = { ...mockTx, amount: 45000 };
    const policy: any = {
      ...DEFAULT_POLICY,
      highValueEscalationThreshold: 10000,
      requireApprovalForHighValue: true,
    };
    const candidates = scoreInterventions(highValueTx, 0.80);

    const result = runGuardianCheck({
      transaction: highValueTx,
      policy,
      proposedIntervention: 'delayed_retry',
      proposedDiscountPct: 0,
      contactAttemptsSoFar: 0,
      allCandidates: candidates,
    });

    expect(result.result).toBe('escalated');
    expect(result.reason).toContain('Requires merchant approval');
  });

  it('stops when recovery probability is below policy threshold', () => {
    const lowProbTx = { ...mockTx, recoveryProbability: 0.12 };
    const policy: any = { ...DEFAULT_POLICY, minimumRecoveryProbability: 0.25 };
    const candidates = scoreInterventions(lowProbTx, 0.12);

    const result = runGuardianCheck({
      transaction: lowProbTx,
      policy,
      proposedIntervention: 'delayed_retry',
      proposedDiscountPct: 0,
      contactAttemptsSoFar: 0,
      allCandidates: candidates,
    });

    expect(result.result).toBe('stopped');
  });
});
