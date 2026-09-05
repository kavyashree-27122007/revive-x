// ============================================================
// Unit Tests: Duplicate Recovery Prevention & Idempotency
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import {
  inMemoryTransactions,
  executeRecovery,
  saveTransaction,
} from '../engines/recoveryOrchestrator.js';

describe('Idempotency & Duplicate Prevention', () => {
  beforeEach(() => {
    inMemoryTransactions.clear();
  });

  it('prevents executing recovery multiple times on the same transaction', async () => {
    const mockTx: any = {
      transactionId: 'TXN-DUP-01',
      amount: 7500,
      timestamp: new Date(),
      paymentStatus: 'failed',
      failureReason: 'bank_timeout',
      retryCount: 0,
      recoveryProbability: 0.85,
      expectedRecovery: 6375,
      interventionCost: 0,
      expectedNetRecovery: 6375,
      recommendedIntervention: 'delayed_retry',
      recoveryStatus: 'pending',
      customerHistory: { totalTransactions: 5, successfulTransactions: 4 },
      checkoutActivity: { pagesViewed: 3, timeOnCheckout: 60, cartValue: 7500, abandonedAt: null },
    };

    await saveTransaction(mockTx);

    // First execution succeeds
    const firstRun = await executeRecovery('TXN-DUP-01');
    expect(firstRun.success).toBe(true);
    expect(firstRun.transaction.recoveryStatus).toBe('recovered');

    // Second execution MUST throw error
    await expect(executeRecovery('TXN-DUP-01')).rejects.toThrow(
      /already been processed/
    );
  });
});
