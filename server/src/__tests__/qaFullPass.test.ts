// ============================================================
// Comprehensive QA Test Suite — Full Pass Verification
// Tests all 8 core QA scenarios required for REVIVE X
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import {
  analyzeTransaction,
  executeRecovery,
  runWhatIfSimulation,
  getDashboardSummary,
  saveTransaction,
  getTransactionById,
  inMemoryTransactions,
  inMemoryActions,
} from '../engines/recoveryOrchestrator.js';
import { runGuardianCheck } from '../engines/guardianEngine.js';
import { scoreInterventions } from '../engines/interventionScorer.js';
import { calculateRecoveryProbability } from '../engines/probabilityCalculator.js';
import { analyzeTransactionDeterministic, generateExplanation } from '../engines/deterministicEngine.js';
import { createAIProvider, resetAIProvider } from '../engines/aiProvider.js';
import { verifyWebhookSignature } from '../routes/webhooks.js';
import { DEFAULT_POLICY } from '@revive-x/shared';
import crypto from 'crypto';

describe('REVIVE X — Comprehensive QA Pass', () => {
  beforeEach(() => {
    inMemoryTransactions.clear();
    inMemoryActions.clear();
    resetAIProvider();
  });

  // ── Scenario 1: Successful Recovery Execution ───────────────
  it('QA 1: Successful Recovery Execution updates status and records audit', async () => {
    const tx: any = {
      transactionId: 'QA-TXN-SUCCESS-01',
      customerId: 'CUST-QA-01',
      customerName: 'Test Success Customer',
      amount: 4500,
      timestamp: new Date(),
      paymentStatus: 'failed',
      failureReason: 'network_timeout',
      retryCount: 0,
      customerHistory: { totalTransactions: 10, successfulTransactions: 9, totalSpend: 45000, averageOrderValue: 4500, daysSinceFirstTransaction: 120 },
      product: 'SaaS Pro',
      category: 'Software',
      subscriptionStatus: 'active',
      checkoutActivity: { pagesViewed: 5, timeOnCheckout: 120, cartValue: 4500, abandonedAt: null },
      recoveryProbability: 0.85,
      expectedRecovery: 3825,
      interventionCost: 0,
      expectedNetRecovery: 3825,
      recommendedIntervention: 'delayed_retry',
      recoveryStatus: 'pending',
      seed: 101,
    };

    await saveTransaction(tx);
    const result = await executeRecovery('QA-TXN-SUCCESS-01');

    expect(result.success).toBe(true);
    expect(result.transaction.recoveryStatus).toBe('recovered');
    expect(result.transaction.paymentStatus).toBe('success');
    expect(result.action.isMockExecution).toBe(true);
  });

  // ── Scenario 2: Blocked Policy Violation ────────────────────
  it('QA 2: Blocked Policy Violation blocks 25% discount and selects compliant alternative', () => {
    const tx: any = {
      transactionId: 'QA-TXN-BLOCK-02',
      amount: 5000,
      timestamp: new Date(),
      retryCount: 1,
      recoveryProbability: 0.72,
      expectedNetRecovery: 23040,
    };

    const policy: any = { ...DEFAULT_POLICY, maximumDiscountPercentage: 10 };
    const candidates = scoreInterventions(tx, 0.72, 25);

    const check = runGuardianCheck({
      transaction: tx,
      policy,
      proposedIntervention: 'merchant_incentive',
      proposedDiscountPct: 25, // Requested 25% > Allowed 10%
      contactAttemptsSoFar: 1,
      allCandidates: candidates,
    });

    expect(check.result).toBe('blocked');
    expect(check.violations[0]).toContain('exceeds maximum allowed 10%');
    expect(check.alternativeIntervention).not.toBeNull();
    expect(check.alternativeIntervention).not.toBe('merchant_incentive');
  });

  // ── Scenario 3: STOP Logic ─────────────────────────────────
  it('QA 3: STOP Logic triggers when transaction is outside recovery window or probability is too low', () => {
    const expiredTx: any = {
      transactionId: 'QA-TXN-STOP-03',
      amount: 15000,
      timestamp: new Date(Date.now() - 75 * 3600 * 1000), // 75h ago > 48h limit
      retryCount: 3,
      recoveryProbability: 0.10,
    };

    const policy: any = { ...DEFAULT_POLICY, maximumRecoveryWindowHours: 48 };
    const candidates = scoreInterventions(expiredTx, 0.10);

    const check = runGuardianCheck({
      transaction: expiredTx,
      policy,
      proposedIntervention: 'delayed_retry',
      proposedDiscountPct: 0,
      contactAttemptsSoFar: 3,
      allCandidates: candidates,
    });

    expect(check.result).toBe('stopped');
    expect(check.violations[0]).toContain('Recovery window of 48h exceeded');
  });

  // ── Scenario 4: Duplicate Prevention (Idempotency) ─────────
  it('QA 4: Duplicate Recovery Prevention prevents re-executing already recovered transactions', async () => {
    const tx: any = {
      transactionId: 'QA-TXN-DUP-04',
      amount: 6000,
      timestamp: new Date(),
      paymentStatus: 'failed',
      failureReason: 'bank_timeout',
      retryCount: 0,
      recoveryProbability: 0.80,
      expectedNetRecovery: 4800,
      recommendedIntervention: 'delayed_retry',
      recoveryStatus: 'pending',
      customerHistory: { totalTransactions: 5, successfulTransactions: 4, totalSpend: 24000, averageOrderValue: 4800, daysSinceFirstTransaction: 90 },
      checkoutActivity: { pagesViewed: 4, timeOnCheckout: 90, cartValue: 6000, abandonedAt: null },
    };

    await saveTransaction(tx);
    const firstRun = await executeRecovery('QA-TXN-DUP-04');
    expect(firstRun.success).toBe(true);

    // Second execution must throw idempotency error
    await expect(executeRecovery('QA-TXN-DUP-04')).rejects.toThrow(/already been processed/);
  });

  // ── Scenario 5: AI Failure Fallback ─────────────────────────
  it('QA 5: AI Failure Fallback seamlessly uses deterministic engine without crashing', async () => {
    delete process.env.GEMINI_API_KEY;
    const provider = await createAIProvider();

    expect(provider.getProviderName()).toBe('deterministic_engine');

    const tx: any = {
      transactionId: 'QA-TXN-AI-05',
      amount: 12000,
      timestamp: new Date(),
      paymentStatus: 'failed',
      failureReason: 'do_not_honour',
      retryCount: 1,
      customerHistory: { totalTransactions: 8, successfulTransactions: 7, totalSpend: 84000, averageOrderValue: 10500, daysSinceFirstTransaction: 150 },
      checkoutActivity: { pagesViewed: 6, timeOnCheckout: 150, cartValue: 12000, abandonedAt: null },
    };

    const analysis = await provider.analyzeTransaction(tx, DEFAULT_POLICY as any);
    expect(analysis.proposedBy).toBe('deterministic_engine');
    expect(analysis.explanation).toBeDefined();
    expect(analysis.candidates.length).toBe(8);
  });

  // ── Scenario 6: Razorpay Failure Fallback ────────────────────
  it('QA 6: Razorpay Failure Fallback handles missing or invalid credentials using Mock Mode', async () => {
    const tx: any = {
      transactionId: 'QA-TXN-RZP-06',
      amount: 8000,
      timestamp: new Date(),
      paymentStatus: 'failed',
      failureReason: 'card_declined_temporary',
      retryCount: 0,
      recoveryProbability: 0.75,
      expectedNetRecovery: 6000,
      recommendedIntervention: 'payment_link',
      recoveryStatus: 'pending',
      customerHistory: { totalTransactions: 6, successfulTransactions: 5, totalSpend: 30000, averageOrderValue: 5000, daysSinceFirstTransaction: 100 },
      checkoutActivity: { pagesViewed: 3, timeOnCheckout: 60, cartValue: 8000, abandonedAt: null },
    };

    await saveTransaction(tx);
    const result = await executeRecovery('QA-TXN-RZP-06');

    expect(result.mode).toBe('mock_mode');
    expect(result.action.isMockExecution).toBe(true);
    expect(result.action.razorpayOrderId).toContain('order_mock_');
  });

  // ── Scenario 7: Webhook Signature Validation ──────────────
  it('QA 7: Webhook Signature Validation accepts valid HMAC-SHA256 and rejects tampered signatures', () => {
    const secret = 'rzp_test_secret_qa_pass_123';
    const payload = JSON.stringify({ event: 'payment.captured', id: 'pay_123' });

    const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    expect(verifyWebhookSignature(payload, validSig, secret)).toBe(true);
    expect(verifyWebhookSignature(payload, 'forged_signature_1234567890abcdef', secret)).toBe(false);
    expect(verifyWebhookSignature(payload.replace('pay_123', 'pay_999'), validSig, secret)).toBe(false);
  });

  // ── Scenario 8: Batch Calculations & What-If Simulator ──────
  it('QA 8: Batch Calculations & What-If Simulator compute 5 strategies safely without NaN or Infinity', async () => {
    for (let i = 1; i <= 20; i++) {
      const tx: any = {
        transactionId: `QA-BATCH-TXN-${i}`,
        amount: 2000 * i,
        timestamp: new Date(),
        paymentStatus: i % 2 === 0 ? 'failed' : 'abandoned',
        failureReason: 'bank_timeout',
        retryCount: i % 3,
        recoveryProbability: 0.4 + (i % 5) * 0.1,
        expectedRecovery: 1000 * i,
        expectedNetRecovery: 950 * i,
        recoveryStatus: 'pending',
        customerHistory: { totalTransactions: 5, successfulTransactions: 4, totalSpend: 10000, averageOrderValue: 2000, daysSinceFirstTransaction: 60 },
        checkoutActivity: { pagesViewed: 3, timeOnCheckout: 45, cartValue: 2000 * i, abandonedAt: null },
      };
      await saveTransaction(tx);
    }

    const sim = await runWhatIfSimulation(DEFAULT_POLICY as any, 20);
    expect(sim.strategies.length).toBe(5);
    expect(sim.aiSelectedStrategyId).toBe('strategy_e');

    for (const s of sim.strategies) {
      expect(isNaN(s.expectedRecoveredRevenue)).toBe(false);
      expect(isNaN(s.netRecoveredRevenue)).toBe(false);
      expect(isFinite(s.recoveryRate)).toBe(true);
    }

    const summary = await getDashboardSummary();
    expect(isNaN(summary.revenueProcessed)).toBe(false);
    expect(isNaN(summary.netRecoveredRevenue)).toBe(false);
  });
});
