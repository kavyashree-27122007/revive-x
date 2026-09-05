// ============================================================
// Unit Tests: AI Provider & Deterministic Fallback Engine
// ============================================================
import { describe, it, expect } from 'vitest';
import { createAIProvider, getAIProvider } from '../engines/aiProvider.js';
import { analyzeTransactionDeterministic, generateExplanation } from '../engines/deterministicEngine.js';
import { scoreInterventions } from '../engines/interventionScorer.js';
import { DEFAULT_POLICY } from '@revive-x/shared';

describe('AI Provider & Fallback Engine', () => {
  const mockTx: any = {
    transactionId: 'TXN-TEST-AI',
    amount: 12000,
    timestamp: new Date(),
    paymentStatus: 'failed',
    failureReason: 'bank_timeout',
    retryCount: 1,
    customerHistory: { totalTransactions: 10, successfulTransactions: 9 },
    checkoutActivity: { pagesViewed: 5, timeOnCheckout: 120, cartValue: 12000, abandonedAt: null },
    leakageType: 'payment_failure',
    recoveryProbability: 0.75,
    expectedNetRecovery: 9000,
  };

  it('falls back to deterministic engine gracefully when API key is missing or invalid', async () => {
    delete process.env.GEMINI_API_KEY;
    const provider = await createAIProvider();

    expect(provider.getProviderName()).toBe('deterministic_engine');
    const analysis = await provider.analyzeTransaction(mockTx, DEFAULT_POLICY as any);

    expect(analysis.transactionId).toBe(mockTx.transactionId);
    expect(analysis.recoveryProbability).toBeGreaterThan(0);
    expect(analysis.candidates.length).toBe(8);
    expect(analysis.explanation).toBeDefined();
    expect(analysis.explanation.length).toBeGreaterThan(20);
  });

  it('generates real data-driven explanations referencing actual amounts and probabilities', () => {
    const candidates = scoreInterventions(mockTx, 0.75);
    const explanation = generateExplanation(mockTx, 'delayed_retry', candidates, DEFAULT_POLICY as any);

    expect(explanation).toContain('Delayed retry');
    expect(explanation).toContain('Recovery probability');
    expect(explanation).toContain('Expected net recovery');
  });
});
