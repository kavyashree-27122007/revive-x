// ============================================================
// REVIVE X — Recovery Orchestrator & What-If Recovery Simulator
// Handles pipeline analysis, policy checks, execution, and simulator calculations
// ============================================================
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { ITransaction } from '../models/Transaction.js';
import { TransactionModel } from '../models/Transaction.js';
import { RecoveryActionModel, type IRecoveryAction } from '../models/RecoveryAction.js';
import { getOrCreateDefaultPolicy, type IMerchantPolicy } from '../models/MerchantPolicy.js';
import { isMongoConnected } from '../config/db.js';
import { createAuditEntry } from '../utils/audit.js';
import {
  getRazorpayClient,
  getRazorpayMode,
  getRazorpayKeyIdPublic,
  getRazorpayKeySecret,
} from '../config/razorpay.js';
import { calculateRecoveryProbability, calculateRiskScore, getRiskLevel } from './probabilityCalculator.js';
import { scoreInterventions, CONTACT_INTERVENTIONS } from './interventionScorer.js';
import { runGuardianCheck } from './guardianEngine.js';
import { classifyLeakageType } from './deterministicEngine.js';
import { getAIProvider } from './aiProvider.js';
import { safeROI, recoveryRate, round2, formatINR } from '../utils/financial.js';
import type {
  InterventionType,
  RecoveryStatus,
  SimulationResult,
  SimulationStrategy,
  DashboardSummary,
  RiskLevel,
} from '@revive-x/shared';

import { generateSyntheticDataset } from './datasetGenerator.js';

// In-Memory store fallback when MongoDB is not connected
export const inMemoryTransactions: Map<string, any> = new Map();
export const inMemoryActions: Map<string, any> = new Map();

// Vercel Serverless Cold Start Fix: Synchronously pre-populate data
try {
  const initialData = generateSyntheticDataset(1000, 42);
  for (const tx of initialData) {
    inMemoryTransactions.set(tx.transactionId, tx);
  }
  console.info(`[Init] Vercel Serverless: Pre-populated 1000 mock transactions in memory.`);
} catch (e) {
  console.warn('[Init] Pre-population failed:', e);
}

/**
 * Run full AI & Guardian analysis on a single transaction
 */
export async function analyzeTransaction(
  txId: string,
  customPolicy?: IMerchantPolicy
): Promise<{ transaction: ITransaction; action: IRecoveryAction; guardianResult: any }> {
  const tx = await getTransactionById(txId);
  if (!tx) {
    throw new Error(`Transaction ${txId} not found`);
  }

  const policy = customPolicy || (await getOrCreateDefaultPolicy());

  // 1. Detect Leakage & Risk
  const leakageType = tx.leakageType || classifyLeakageType(tx);
  const recoveryProb = calculateRecoveryProbability(tx);
  const riskScore = calculateRiskScore(tx);
  const riskLvl = getRiskLevel(riskScore);

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'REVENUE_RISK_DETECTED',
    actor: 'SYSTEM',
    action: 'Detect revenue at risk',
    reason: `Transaction classified as ${leakageType} with risk score ${riskScore}`,
    amount: tx.amount,
    status: 'AT_RISK',
    metadata: { leakageType, riskScore },
  });

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'TRANSACTION_DIAGNOSED',
    actor: 'AI_ENGINE',
    action: 'Diagnose revenue leakage root cause',
    reason: `Identified failure reason: ${tx.failureReason || 'unknown'} across ${tx.retryCount} retries`,
    amount: tx.amount,
    status: 'DIAGNOSED',
  });

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'RECOVERY_PROBABILITY_CALCULATED',
    actor: 'AI_ENGINE',
    action: 'Calculate recovery probability',
    reason: `Calculated recovery probability of ${(recoveryProb * 100).toFixed(1)}% using customer history & failure pattern`,
    amount: tx.amount,
    status: 'PROBABILITY_SCORED',
    metadata: { recoveryProbability: recoveryProb },
  });

  // 2. Score candidate interventions
  const discountPct = tx.transactionId === 'TXN-DEMO-9999' ? 25 : Math.min(5, policy.maximumDiscountPercentage);
  const candidates = scoreInterventions(tx, recoveryProb, discountPct);

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'INTERVENTIONS_EVALUATED',
    actor: 'AI_ENGINE',
    action: 'Evaluate recovery strategies',
    reason: `Evaluated ${candidates.length} recovery candidates across probability, net recovery, and customer friction`,
    amount: tx.amount,
    status: 'EVALUATED',
  });

  // Determine top proposed intervention
  // For TXN-DEMO-9999 special demo case: AI initially proposes 25% incentive to demonstrate Guardian block
  let proposedIntervention: InterventionType = candidates[0].type;
  if (tx.transactionId === 'TXN-DEMO-9999') {
    proposedIntervention = 'merchant_incentive';
  }

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'AI_RECOMMENDATION_CREATED',
    actor: 'AI_ENGINE',
    action: 'Recommend optimal intervention',
    reason: `Selected ${proposedIntervention} with expected net recovery ₹${candidates.find(c => c.type === proposedIntervention)?.expectedNetRecovery || 0}`,
    amount: tx.amount,
    status: 'RECOMMENDED',
  });

  // 3. Guardian Policy Check
  const guardianResult = runGuardianCheck({
    transaction: tx,
    policy,
    proposedIntervention,
    proposedDiscountPct: discountPct,
    contactAttemptsSoFar: tx.retryCount,
    allCandidates: candidates,
  });

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'POLICY_CHECK',
    actor: 'GUARDIAN',
    action: 'Validate intervention against merchant guardrails',
    reason: guardianResult.reason,
    policyResult: guardianResult.result,
    amount: tx.amount,
    status: guardianResult.result.toUpperCase(),
    metadata: { violations: guardianResult.violations },
  });

  let finalIntervention = proposedIntervention;
  let alternativeChosen = false;
  let originalBlocked: InterventionType | null = null;
  let finalStatus: RecoveryStatus = 'pending';

  if (guardianResult.result === 'approved') {
    finalStatus = 'approved';
    await createAuditEntry({
      transactionId: tx.transactionId,
      eventType: 'ACTION_APPROVED',
      actor: 'GUARDIAN',
      action: 'Approve intervention',
      reason: 'All merchant policies satisfied',
      policyResult: 'approved',
      amount: tx.amount,
      status: 'APPROVED',
    });
  } else if (guardianResult.result === 'blocked') {
    finalStatus = 'blocked';
    originalBlocked = proposedIntervention;
    await createAuditEntry({
      transactionId: tx.transactionId,
      eventType: 'ACTION_BLOCKED',
      actor: 'GUARDIAN',
      action: 'Block non-compliant intervention',
      reason: guardianResult.reason,
      policyResult: 'blocked',
      amount: tx.amount,
      status: 'BLOCKED',
    });

    // Select compliant alternative if available
    if (guardianResult.alternativeIntervention) {
      finalIntervention = guardianResult.alternativeIntervention;
      alternativeChosen = true;
      finalStatus = 'approved'; // Alternative is approved
      await createAuditEntry({
        transactionId: tx.transactionId,
        eventType: 'ACTION_APPROVED',
        actor: 'GUARDIAN',
        action: 'Approve compliant fallback intervention',
        reason: `Fallback to ${finalIntervention} satisfies all merchant policies`,
        policyResult: 'approved',
        amount: tx.amount,
        status: 'APPROVED',
      });
    }
  } else if (guardianResult.result === 'escalated') {
    finalStatus = 'escalated';
    await createAuditEntry({
      transactionId: tx.transactionId,
      eventType: 'ACTION_ESCALATED',
      actor: 'GUARDIAN',
      action: 'Escalate to merchant operator',
      reason: guardianResult.reason,
      policyResult: 'escalated',
      amount: tx.amount,
      status: 'ESCALATED',
    });
  } else if (guardianResult.result === 'stopped') {
    finalStatus = 'stopped';
    finalIntervention = 'stop';
    await createAuditEntry({
      transactionId: tx.transactionId,
      eventType: 'ACTION_STOPPED',
      actor: 'GUARDIAN',
      action: 'Cease recovery operations',
      reason: guardianResult.reason,
      policyResult: 'stopped',
      amount: tx.amount,
      status: 'STOPPED',
    });
  }

  // Calculate metrics for final chosen intervention
  const chosenCandidate = candidates.find((c) => c.type === finalIntervention) || candidates[0];
  const interventionCost = chosenCandidate ? chosenCandidate.interventionCost : 0;
  const expRecovery = chosenCandidate ? chosenCandidate.expectedRecovery : 0;
  const expNetRecovery = chosenCandidate ? chosenCandidate.expectedNetRecovery : 0;

  // Explanation via AI provider (with deterministic fallback)
  const aiProvider = getAIProvider();
  let explanation = '';
  try {
    explanation = await aiProvider.generateExplanation(tx, finalIntervention, policy);
  } catch {
    explanation = `Selected ${finalIntervention} as it provides the highest compliant expected net recovery.`;
  }

  // Update transaction record
  tx.leakageType = leakageType;
  tx.recoveryProbability = recoveryProb;
  tx.riskScore = riskScore;
  tx.riskLevel = riskLvl;
  tx.expectedRecovery = expRecovery;
  tx.interventionCost = interventionCost;
  tx.expectedNetRecovery = expNetRecovery;
  tx.recommendedIntervention = finalIntervention;
  tx.recoveryStatus = finalStatus;
  tx.analysisTimestamp = new Date();

  await saveTransaction(tx);

  // Create Recovery Action record
  const actionData: any = {
    actionId: `ACT-${uuidv4().substring(0, 8).toUpperCase()}`,
    transactionId: tx.transactionId,
    interventionType: finalIntervention,
    proposedBy: aiProvider.getProviderName(),
    policyResult: guardianResult.result,
    policyViolations: guardianResult.violations,
    expectedNetRecovery: expNetRecovery,
    interventionCost,
    proposedDiscountPct: proposedIntervention === 'merchant_incentive' ? discountPct : 0,
    executedAt: null,
    resultStatus: null,
    razorpayOrderId: null,
    isMockExecution: getRazorpayMode() === 'mock_mode',
    explanation,
    alternativeChosen,
    originalBlockedIntervention: originalBlocked,
  };

  const action = await saveRecoveryAction(actionData);

  return { transaction: tx, action, guardianResult };
}

/**
 * Batch analysis on transactions
 */
export async function runBatchAnalysis(limit: number = 2000): Promise<{
  processed: number;
  approved: number;
  blocked: number;
  escalated: number;
  stopped: number;
}> {
  const policy = await getOrCreateDefaultPolicy();
  const atRiskTx = await getAtRiskTransactions(limit);

  let approved = 0;
  let blocked = 0;
  let escalated = 0;
  let stopped = 0;

  for (const tx of atRiskTx) {
    try {
      const { guardianResult } = await analyzeTransaction(tx.transactionId, policy);
      if (guardianResult.result === 'approved') approved++;
      else if (guardianResult.result === 'blocked') blocked++;
      else if (guardianResult.result === 'escalated') escalated++;
      else if (guardianResult.result === 'stopped') stopped++;
    } catch (err) {
      console.error(`Error analyzing ${tx.transactionId}:`, err);
    }
  }

  return {
    processed: atRiskTx.length,
    approved,
    blocked,
    escalated,
    stopped,
  };
}

/**
 * Execute an approved recovery intervention
 * Enforces server-side policy check, idempotency, Razorpay order creation / mock execution, and audit logging
 */
export async function executeRecovery(
  transactionId: string,
  actionId?: string
): Promise<{
  success: boolean;
  transaction: ITransaction;
  action: IRecoveryAction;
  razorpayOrder?: any;
  mode?: string;
  keyId?: string | null;
}> {
  const tx = await getTransactionById(transactionId);
  if (!tx) throw new Error(`Transaction ${transactionId} not found`);

  // Idempotency: Prevent duplicate execution if already recovered or executed
  if (tx.recoveryStatus === 'recovered' || tx.recoveryStatus === 'executed') {
    throw new Error(`Transaction ${transactionId} has already been processed (status: ${tx.recoveryStatus})`);
  }

  // Check policy before execution (Non-negotiable rule #5)
  const policy = await getOrCreateDefaultPolicy();
  const interventionToExecute = tx.recommendedIntervention || 'payment_reminder';

  const guardianCheck = runGuardianCheck({
    transaction: tx,
    policy,
    proposedIntervention: interventionToExecute,
    proposedDiscountPct: 5,
    contactAttemptsSoFar: tx.retryCount,
    allCandidates: scoreInterventions(tx, tx.recoveryProbability),
  });

  if (guardianCheck.result === 'blocked' || guardianCheck.result === 'stopped') {
    throw new Error(`Cannot execute: Intervention ${interventionToExecute} is ${guardianCheck.result} by policy: ${guardianCheck.reason}`);
  }

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'ACTION_EXECUTED',
    actor: 'SYSTEM',
    action: `Execute recovery intervention: ${interventionToExecute}`,
    reason: `Initiated ${interventionToExecute} execution`,
    amount: tx.amount,
    status: 'EXECUTING',
  });

  let razorpayOrder = null;
  const razorpay = getRazorpayClient();
  const isMock = getRazorpayMode() === 'mock_mode' || !razorpay;

  if (!isMock && razorpay) {
    // ============================================================
    // RAZORPAY TEST MODE: Real server-side order creation
    // ============================================================
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(tx.amount * 100), // in paise
        currency: 'INR',
        receipt: `rcpt_${tx.transactionId.substring(0, 30)}`,
        notes: {
          transactionId: tx.transactionId,
          intervention: interventionToExecute,
        },
      });

      await createAuditEntry({
        transactionId: tx.transactionId,
        eventType: 'ACTION_EXECUTED',
        actor: 'RAZORPAY',
        action: `Create Razorpay Test Order: ${razorpayOrder.id}`,
        reason: `Created real test order on Razorpay for ${formatINR(tx.amount)}. Awaiting payment capture / webhook verification.`,
        amount: tx.amount,
        status: 'ORDER_CREATED',
        metadata: { razorpayOrderId: razorpayOrder.id, isMock: false },
      });

      // In real Razorpay mode: DO NOT fake success. Keep status as executing/approved until verified webhook/capture
      tx.recommendedIntervention = interventionToExecute;
      await saveTransaction(tx);

      const actionData: any = {
        actionId: actionId || `ACT-${uuidv4().substring(0, 8).toUpperCase()}`,
        transactionId: tx.transactionId,
        interventionType: interventionToExecute,
        proposedBy: 'deterministic_engine',
        policyResult: guardianCheck.result,
        policyViolations: [],
        expectedNetRecovery: tx.expectedNetRecovery,
        interventionCost: tx.interventionCost,
        proposedDiscountPct: 0,
        executedAt: new Date(),
        resultStatus: 'pending',
        razorpayOrderId: razorpayOrder.id,
        isMockExecution: false,
        explanation: `Created Razorpay Test Order ${razorpayOrder.id}. Awaiting test payment capture or webhook.`,
        alternativeChosen: false,
        originalBlockedIntervention: null,
      };

      const savedAction = await saveRecoveryAction(actionData);

      return {
        success: true,
        transaction: tx,
        action: savedAction,
        razorpayOrder,
        mode: 'test_mode',
        keyId: getRazorpayKeyIdPublic(),
      };
    } catch (err: any) {
      console.warn(`[Razorpay] Live API order creation failed: ${err.message}. Falling back to MOCK MODE.`);
    }
  }

  // ============================================================
  // MOCK MODE: Deterministic simulation fallback
  // Clearly labelled — NEVER pretends to be live Razorpay
  // ============================================================
  const recoveryThreshold = 0.35; // Probabilities >= 0.35 succeed in demo execution
  const isRecovered = tx.recoveryProbability >= recoveryThreshold;

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'RESULT_RECEIVED',
    actor: 'SYSTEM',
    action: '[MOCK MODE] Deterministic simulated recovery execution',
    reason: isRecovered
      ? '[MOCK MODE] Simulated customer completed payment after recovery intervention.'
      : '[MOCK MODE] Simulated payment retry declined by issuer.',
    amount: tx.amount,
    status: isRecovered ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
    metadata: { isMockExecution: true, mode: 'MOCK_MODE' },
  });

  if (isRecovered) {
    tx.recoveryStatus = 'recovered';
    tx.paymentStatus = 'success';
    await createAuditEntry({
      transactionId: tx.transactionId,
      eventType: 'RECOVERY_RECORDED',
      actor: 'SYSTEM',
      action: '[MOCK MODE] Record simulated recovered revenue',
      reason: `[MOCK MODE] Recovered ${formatINR(tx.amount)} via ${interventionToExecute} in deterministic simulation`,
      amount: tx.amount,
      status: 'RECOVERED',
      metadata: { isMockExecution: true },
    });
  } else {
    tx.recoveryStatus = 'failed';
    tx.retryCount += 1;
  }

  await saveTransaction(tx);

  const actionData: any = {
    actionId: actionId || `ACT-${uuidv4().substring(0, 8).toUpperCase()}`,
    transactionId: tx.transactionId,
    interventionType: interventionToExecute,
    proposedBy: 'deterministic_engine',
    policyResult: guardianCheck.result,
    policyViolations: [],
    expectedNetRecovery: tx.expectedNetRecovery,
    interventionCost: tx.interventionCost,
    proposedDiscountPct: 0,
    executedAt: new Date(),
    resultStatus: isRecovered ? 'success' : 'failed',
    razorpayOrderId: `order_mock_${tx.transactionId}`,
    isMockExecution: true,
    explanation: `[MOCK MODE] Simulated execution for ${interventionToExecute}. Result: ${isRecovered ? 'Simulated Recovery Succeeded' : 'Simulated Recovery Failed'}. (Razorpay credentials not provided).`,
    alternativeChosen: false,
    originalBlockedIntervention: null,
  };

  const savedAction = await saveRecoveryAction(actionData);

  return {
    success: isRecovered,
    transaction: tx,
    action: savedAction,
    mode: 'mock_mode',
    razorpayOrder: null,
  };
}

/**
 * Verify payment server-side using Razorpay Test APIs and HMAC signature
 * Server-authoritative: NEVER trusts frontend claim alone
 */
export async function verifyRazorpayPayment(
  transactionId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<{ success: boolean; transaction: ITransaction; message: string }> {
  const tx = await getTransactionById(transactionId);
  if (!tx) throw new Error(`Transaction ${transactionId} not found`);

  const razorpay = getRazorpayClient();
  const keySecret = getRazorpayKeySecret();
  const isMock = getRazorpayMode() === 'mock_mode' || !razorpay || !keySecret;

  if (isMock) {
    // In Mock Mode, handle deterministic verification
    tx.recoveryStatus = 'recovered';
    tx.paymentStatus = 'success';
    await saveTransaction(tx);
    return {
      success: true,
      transaction: tx,
      message: '[MOCK MODE] Payment verification simulated successfully.',
    };
  }

  // 1. Verify HMAC-SHA256 signature server-side
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const sigBuf = Buffer.from(razorpaySignature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Razorpay payment signature verification failed. Possible tampering detected.');
  }

  // 2. Fetch payment from Razorpay API to confirm capture status
  const payment = await razorpay.payments.fetch(razorpayPaymentId);
  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new Error(`Razorpay payment status is ${payment.status}, expected captured.`);
  }

  // 3. Mark transaction as successfully recovered
  tx.paymentStatus = 'success';
  tx.recoveryStatus = 'recovered';
  await saveTransaction(tx);

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'RESULT_RECEIVED',
    actor: 'RAZORPAY',
    action: `Verified Razorpay payment ${razorpayPaymentId}`,
    reason: `Payment verified via Razorpay API and HMAC-SHA256 signature for Order ${razorpayOrderId}`,
    amount: tx.amount,
    status: 'PAYMENT_SUCCESS',
    metadata: { razorpayPaymentId, razorpayOrderId },
  });

  await createAuditEntry({
    transactionId: tx.transactionId,
    eventType: 'RECOVERY_RECORDED',
    actor: 'SYSTEM',
    action: 'Record verified recovered revenue',
    reason: `Successfully recovered ${formatINR(tx.amount)} verified by Razorpay`,
    amount: tx.amount,
    status: 'RECOVERED',
  });

  return {
    success: true,
    transaction: tx,
    message: `Payment ${razorpayPaymentId} successfully verified with Razorpay.`,
  };
}

/**
 * What-If Recovery Simulator
 * Real dynamic calculation over loaded dataset comparing 5 strategies:
 * Strategy A: Immediate Retry
 * Strategy B: Delayed Retry
 * Strategy C: Reminder
 * Strategy D: Incentive
 * Strategy E: Smart Segmented Recovery (AI-selected per transaction)
 */
export async function runWhatIfSimulation(
  customPolicy?: IMerchantPolicy,
  sampleLimit: number = 3000
): Promise<SimulationResult> {
  const policy = customPolicy || (await getOrCreateDefaultPolicy());
  const transactions = await getAtRiskTransactions(sampleLimit);

  let totalRiskAmount = 0;

  // Track metrics for each strategy
  const stats = {
    immediate_retry: { recovered: 0, cost: 0, count: 0, contacts: 0, violations: 0 },
    delayed_retry: { recovered: 0, cost: 0, count: 0, contacts: 0, violations: 0 },
    payment_reminder: { recovered: 0, cost: 0, count: 0, contacts: 0, violations: 0 },
    merchant_incentive: { recovered: 0, cost: 0, count: 0, contacts: 0, violations: 0 },
    smart_segmented: { recovered: 0, cost: 0, count: 0, contacts: 0, violations: 0 },
  };

  for (const tx of transactions) {
    const amount = tx.amount;
    totalRiskAmount += amount;
    const baseProb = tx.recoveryProbability > 0 ? tx.recoveryProbability : calculateRecoveryProbability(tx);

    // 1. Immediate Retry
    {
      const prob = round2(Math.min(baseProb * 0.85, 1));
      const expRec = amount * prob;
      const cost = 0;
      let violations = 0;
      if (tx.retryCount >= policy.maximumRetryAttempts) violations++;
      if (!policy.allowedInterventionTypes.includes('immediate_retry')) violations++;

      stats.immediate_retry.recovered += expRec;
      stats.immediate_retry.cost += cost;
      stats.immediate_retry.violations += violations;
    }

    // 2. Delayed Retry
    {
      const prob = round2(Math.min(baseProb * 1.05, 1));
      const expRec = amount * prob;
      const cost = 0;
      let violations = 0;
      if (tx.retryCount >= policy.maximumRetryAttempts) violations++;
      if (!policy.allowedInterventionTypes.includes('delayed_retry')) violations++;

      stats.delayed_retry.recovered += expRec;
      stats.delayed_retry.cost += cost;
      stats.delayed_retry.violations += violations;
    }

    // 3. Payment Reminder
    {
      const prob = round2(Math.min(baseProb * 0.90, 1));
      const expRec = amount * prob;
      const cost = 5; // ₹5 per reminder
      let violations = 0;
      if (tx.retryCount >= policy.maximumContactAttempts) violations++;
      if (!policy.allowedInterventionTypes.includes('payment_reminder')) violations++;

      stats.payment_reminder.recovered += expRec;
      stats.payment_reminder.cost += cost;
      stats.payment_reminder.contacts += 1;
      stats.payment_reminder.violations += violations;
    }

    // 4. Merchant Incentive (using policy max discount)
    {
      const discountPct = policy.maximumDiscountPercentage;
      const prob = round2(Math.min(baseProb * 1.20, 1));
      const expRec = amount * prob;
      const cost = round2((discountPct / 100) * expRec);
      let violations = 0;
      if (!policy.allowIncentives) violations++;
      if (!policy.allowedInterventionTypes.includes('merchant_incentive')) violations++;

      stats.merchant_incentive.recovered += expRec;
      stats.merchant_incentive.cost += cost;
      stats.merchant_incentive.violations += violations;
    }

    // 5. Smart Segmented Recovery (AI Engine evaluates & selects best compliant strategy per transaction)
    {
      const candidates = scoreInterventions(tx, baseProb, policy.maximumDiscountPercentage);
      // Filter candidates compliant with policy
      const compliant = candidates.filter((c) => {
        if (c.type === 'stop') return true;
        if (!policy.allowedInterventionTypes.includes(c.type)) return false;
        if ((c.type === 'immediate_retry' || c.type === 'delayed_retry') && tx.retryCount >= policy.maximumRetryAttempts) return false;
        if (c.type === 'merchant_incentive' && !policy.allowIncentives) return false;
        if (CONTACT_INTERVENTIONS.has(c.type) && tx.retryCount >= policy.maximumContactAttempts) return false;
        return true;
      });

      const best = compliant.length > 0 ? compliant[0] : candidates[candidates.length - 1]; // stop fallback
      stats.smart_segmented.recovered += best.expectedRecovery;
      stats.smart_segmented.cost += best.interventionCost;
      if (CONTACT_INTERVENTIONS.has(best.type)) {
        stats.smart_segmented.contacts += 1;
      }
    }
  }

  // Helper to build strategy object
  const buildStrategy = (
    strategyId: string,
    label: string,
    interventionType: any,
    st: { recovered: number; cost: number; contacts: number; violations: number }
  ): SimulationStrategy => {
    const recRev = round2(st.recovered);
    const cost = round2(st.cost);
    const netRev = round2(recRev - cost);
    const recRate = totalRiskAmount > 0 ? round2((recRev / totalRiskAmount) * 100) : 0;
    const riskLevel: RiskLevel = st.violations > 50 ? 'high' : st.violations > 0 ? 'medium' : 'low';

    return {
      strategyId,
      label,
      interventionType,
      expectedRecoveredRevenue: recRev,
      interventionCost: cost,
      netRecoveredRevenue: netRev,
      recoveryRate: recRate,
      customerContactCount: st.contacts,
      policyViolations: st.violations,
      riskLevel,
      isAISelected: strategyId === 'strategy_e',
    };
  };

  const strategies: SimulationStrategy[] = [
    buildStrategy('strategy_a', 'Strategy A: Immediate Retry', 'immediate_retry', stats.immediate_retry),
    buildStrategy('strategy_b', 'Strategy B: Delayed Retry', 'delayed_retry', stats.delayed_retry),
    buildStrategy('strategy_c', 'Strategy C: Payment Reminder', 'payment_reminder', stats.payment_reminder),
    buildStrategy('strategy_d', 'Strategy D: Merchant Incentive', 'merchant_incentive', stats.merchant_incentive),
    buildStrategy('strategy_e', 'Strategy E: Smart Segmented Recovery', 'smart_segmented', stats.smart_segmented),
  ];

  return {
    strategies,
    aiSelectedStrategyId: 'strategy_e',
    transactionsAnalyzed: transactions.length,
    revenueAtRisk: round2(totalRiskAmount),
  };
}

/**
 * Dashboard Summary computation from database/in-memory store
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const allTx = await getAllTransactions();

  const totalTransactions = allTx.length;
  let revenueProcessed = 0;
  let revenueAtRisk = 0;
  let potentiallyRecoverable = 0;
  let recoveredRevenue = 0;
  let interventionCost = 0;

  let approved = 0;
  let blocked = 0;
  let escalated = 0;
  let stopped = 0;

  const leakageByType: Record<string, number> = {
    payment_failure: 0,
    checkout_abandonment: 0,
    subscription_failure: 0,
    invoice_overdue: 0,
    repeated_failure: 0,
    high_value_at_risk: 0,
  };

  const interventionDistribution: Record<string, number> = {
    immediate_retry: 0,
    delayed_retry: 0,
    payment_reminder: 0,
    payment_link: 0,
    personalized_message: 0,
    merchant_incentive: 0,
    escalation: 0,
    stop: 0,
  };

  for (const tx of allTx) {
    revenueProcessed += tx.amount;

    if (tx.paymentStatus === 'success' || tx.recoveryStatus === 'recovered') {
      recoveredRevenue += tx.amount;
    } else {
      revenueAtRisk += tx.amount;
      potentiallyRecoverable += (tx.expectedRecovery || Math.round(tx.amount * (tx.recoveryProbability || 0.5)));
    }

    interventionCost += (tx.interventionCost || 0);

    if (tx.leakageType && leakageByType[tx.leakageType] !== undefined) {
      leakageByType[tx.leakageType]++;
    }

    if (tx.recommendedIntervention && interventionDistribution[tx.recommendedIntervention] !== undefined) {
      interventionDistribution[tx.recommendedIntervention]++;
    }

    if (tx.recoveryStatus === 'approved') approved++;
    else if (tx.recoveryStatus === 'blocked') blocked++;
    else if (tx.recoveryStatus === 'escalated') escalated++;
    else if (tx.recoveryStatus === 'stopped') stopped++;
  }

  const netRecoveredRevenue = round2(recoveredRevenue - interventionCost);
  const recRate = recoveryRate(recoveredRevenue, revenueAtRisk);
  const roi = safeROI(netRecoveredRevenue, interventionCost);

  return {
    totalTransactions,
    revenueProcessed: round2(revenueProcessed),
    revenueAtRisk: round2(revenueAtRisk),
    potentiallyRecoverableRevenue: round2(potentiallyRecoverable),
    interventionsGenerated: approved + blocked + escalated + stopped,
    interventionsApproved: approved,
    interventionsBlocked: blocked,
    interventionsEscalated: escalated,
    interventionsStopped: stopped,
    recoveredRevenue: round2(recoveredRevenue),
    interventionCost: round2(interventionCost),
    netRecoveredRevenue,
    recoveryRate: recRate,
    recoveryROI: roi,
    leakageByType: leakageByType as any,
    interventionDistribution: interventionDistribution as any,
    lastAnalysisTimestamp: new Date().toISOString(),
  };
}

// ── Storage Abstraction Helpers ───────────────────────────

export async function getTransactionById(txId: string): Promise<ITransaction | null> {
  if (isMongoConnected()) {
    try {
      const doc = await TransactionModel.findOne({ transactionId: txId });
      if (doc) return doc;
    } catch {
      // fallback
    }
  }
  return inMemoryTransactions.get(txId) || null;
}

export async function saveTransaction(tx: any): Promise<ITransaction> {
  if (isMongoConnected()) {
    try {
      if (tx.save) {
        return await tx.save();
      } else {
        return await TransactionModel.findOneAndUpdate(
          { transactionId: tx.transactionId },
          tx,
          { upsert: true, new: true }
        );
      }
    } catch {
      // fallback
    }
  }
  inMemoryTransactions.set(tx.transactionId, tx);
  return tx as ITransaction;
}

export async function saveRecoveryAction(action: any): Promise<IRecoveryAction> {
  if (isMongoConnected()) {
    try {
      return await RecoveryActionModel.create(action);
    } catch {
      // fallback
    }
  }
  inMemoryActions.set(action.actionId, action);
  return action as IRecoveryAction;
}

export async function getAtRiskTransactions(limit: number = 2000): Promise<ITransaction[]> {
  if (isMongoConnected()) {
    try {
      const docs = await TransactionModel.find({
        paymentStatus: { $ne: 'success' },
      })
        .limit(limit)
        .lean();
      if (docs.length > 0) return docs as unknown as ITransaction[];
    } catch {
      // fallback
    }
  }

  const list: ITransaction[] = [];
  for (const tx of inMemoryTransactions.values()) {
    if (tx.paymentStatus !== 'success') {
      list.push(tx);
      if (list.length >= limit) break;
    }
  }
  return list;
}

export async function getAllTransactions(limit: number = 10000): Promise<ITransaction[]> {
  if (isMongoConnected()) {
    try {
      const docs = await TransactionModel.find({}).limit(limit).lean();
      if (docs.length > 0) return docs as unknown as ITransaction[];
    } catch {
      // fallback
    }
  }
  return Array.from(inMemoryTransactions.values()).slice(0, limit);
}
