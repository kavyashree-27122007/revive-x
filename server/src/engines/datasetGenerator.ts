// ============================================================
// REVIVE X — Synthetic Dataset Generator
// Generates 10,000 realistic transactions with seeded PRNG (mulberry32)
// Includes specific deterministic demo scenarios.
// ============================================================
import type { PaymentStatus, LeakageType } from '@revive-x/shared';
import type { ITransaction } from '../models/Transaction.js';
import { calculateRecoveryProbability, calculateRiskScore, getRiskLevel } from './probabilityCalculator.js';
import { classifyLeakageType } from './deterministicEngine.js';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Rahul', 'Ananya',
  'Siddharth', 'Pooja', 'Karan', 'Sneha', 'Arjun', 'Divya', 'Amit', 'Meera',
  'Varun', 'Kavita', 'Manish', 'Ritu', 'Sameer', 'Shweta', 'Rajesh', 'Sunita'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Mehta', 'Nair', 'Reddy', 'Gupta', 'Iyer',
  'Singh', 'Chopra', 'Joshi', 'Bose', 'Kumar', 'Kapoor', 'Deshmukh', 'Menon'
];

const PRODUCTS = [
  { name: 'SaaS Pro Annual Subscription', category: 'Software', basePrice: 14999 },
  { name: 'Cloud Storage 2TB Plan', category: 'Infrastructure', basePrice: 4999 },
  { name: 'Developer API Credits Bundle', category: 'API', basePrice: 8500 },
  { name: 'Enterprise Analytics Suite', category: 'Analytics', basePrice: 32000 },
  { name: 'E-commerce Checkout Order', category: 'Retail', basePrice: 2499 },
  { name: 'Premium Video Streaming 1Yr', category: 'Media', basePrice: 1999 },
  { name: 'Accounting & Invoicing Tool', category: 'Finance', basePrice: 6200 },
  { name: 'Security Audit & Compliance Plan', category: 'Security', basePrice: 45000 },
  { name: 'Micro-course Masterclass', category: 'Education', basePrice: 999 },
  { name: 'Workspace Collaboration Seat', category: 'Productivity', basePrice: 1200 }
];

const FAILURE_REASONS = [
  'insufficient_funds',
  'network_timeout',
  'bank_timeout',
  'gateway_timeout',
  'do_not_honour',
  'card_declined_temporary',
  'authentication_failed',
  'three_d_secure_failed',
  'card_expired',
  'card_blocked',
  'checkout_abandoned',
  'subscription_paused',
  'invoice_unpaid'
];

export interface RawTransactionInput {
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  timestamp: Date;
  paymentStatus: PaymentStatus;
  failureReason: string | null;
  retryCount: number;
  customerHistory: {
    totalTransactions: number;
    successfulTransactions: number;
    totalSpend: number;
    averageOrderValue: number;
    daysSinceFirstTransaction: number;
  };
  product: string;
  category: string;
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | null;
  checkoutActivity: {
    pagesViewed: number;
    timeOnCheckout: number;
    cartValue: number;
    abandonedAt: string | null;
  };
  leakageType: LeakageType | null;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  recoveryProbability: number;
  expectedRecovery: number;
  interventionCost: number;
  expectedNetRecovery: number;
  recommendedIntervention: any;
  recoveryStatus: any;
  analysisTimestamp: Date | null;
  seed: number;
}

export function generateSyntheticDataset(count: number = 10000, initialSeed: number = 42): RawTransactionInput[] {
  const prng = createPRNG(initialSeed);
  const transactions: RawTransactionInput[] = [];
  const now = Date.now();

  // Helper random functions
  const randInt = (min: number, max: number) => Math.floor(prng() * (max - min + 1)) + min;
  const choice = <T>(arr: readonly T[] | T[]): T => arr[Math.floor(prng() * arr.length)];

  // PRE-CONFIGURED DEMO RECORDS to guarantee test and presentation scenarios
  // 1. TXN-DEMO-9999: Blocked Policy Violation (Amount 32,000, Proposes 25% discount, policy max is 10%)
  const demoBlocked: RawTransactionInput = {
    transactionId: 'TXN-DEMO-9999',
    customerId: 'CUST-DEMO-01',
    customerName: 'Aarav Mehta (Enterprise Lead)',
    amount: 32000,
    timestamp: new Date(now - 3 * 3600 * 1000), // 3 hours ago
    paymentStatus: 'failed',
    failureReason: 'authentication_failed',
    retryCount: 1,
    customerHistory: {
      totalTransactions: 15,
      successfulTransactions: 14,
      totalSpend: 184000,
      averageOrderValue: 13142,
      daysSinceFirstTransaction: 320,
    },
    product: 'Enterprise Analytics Suite',
    category: 'Analytics',
    subscriptionStatus: 'active',
    checkoutActivity: {
      pagesViewed: 8,
      timeOnCheckout: 240,
      cartValue: 32000,
      abandonedAt: null,
    },
    leakageType: 'high_value_at_risk',
    riskScore: 42,
    riskLevel: 'medium',
    recoveryProbability: 0.72,
    expectedRecovery: 23040,
    interventionCost: 0,
    expectedNetRecovery: 23040,
    recommendedIntervention: null,
    recoveryStatus: 'pending',
    analysisTimestamp: null,
    seed: 9999,
  };

  // 2. TXN-DEMO-9998: High-Value Escalation (Amount 45,000, exceeds autonomous limit 10,000)
  const demoEscalated: RawTransactionInput = {
    transactionId: 'TXN-DEMO-9998',
    customerId: 'CUST-DEMO-02',
    customerName: 'Pooja Iyer (VIP Corporate)',
    amount: 45000,
    timestamp: new Date(now - 5 * 3600 * 1000),
    paymentStatus: 'failed',
    failureReason: 'bank_timeout',
    retryCount: 0,
    customerHistory: {
      totalTransactions: 22,
      successfulTransactions: 21,
      totalSpend: 310000,
      averageOrderValue: 14761,
      daysSinceFirstTransaction: 450,
    },
    product: 'Security Audit & Compliance Plan',
    category: 'Security',
    subscriptionStatus: null,
    checkoutActivity: {
      pagesViewed: 6,
      timeOnCheckout: 180,
      cartValue: 45000,
      abandonedAt: null,
    },
    leakageType: 'high_value_at_risk',
    riskScore: 35,
    riskLevel: 'low',
    recoveryProbability: 0.81,
    expectedRecovery: 36450,
    interventionCost: 0,
    expectedNetRecovery: 36450,
    recommendedIntervention: null,
    recoveryStatus: 'pending',
    analysisTimestamp: null,
    seed: 9998,
  };

  // 3. TXN-DEMO-9997: STOP Decision (Low probability, retry limit exceeded)
  const demoStop: RawTransactionInput = {
    transactionId: 'TXN-DEMO-9997',
    customerId: 'CUST-DEMO-03',
    customerName: 'Karan Bose',
    amount: 14999,
    timestamp: new Date(now - 75 * 3600 * 1000), // 75h ago (exceeds 48h recovery window)
    paymentStatus: 'repeated_failure',
    failureReason: 'stolen_card',
    retryCount: 4,
    customerHistory: {
      totalTransactions: 2,
      successfulTransactions: 0,
      totalSpend: 0,
      averageOrderValue: 0,
      daysSinceFirstTransaction: 10,
    },
    product: 'SaaS Pro Annual Subscription',
    category: 'Software',
    subscriptionStatus: 'cancelled',
    checkoutActivity: {
      pagesViewed: 1,
      timeOnCheckout: 15,
      cartValue: 14999,
      abandonedAt: 'payment_page',
    },
    leakageType: 'repeated_failure',
    riskScore: 92,
    riskLevel: 'high',
    recoveryProbability: 0.08,
    expectedRecovery: 1199,
    interventionCost: 0,
    expectedNetRecovery: 1199,
    recommendedIntervention: null,
    recoveryStatus: 'pending',
    analysisTimestamp: null,
    seed: 9997,
  };

  // 4. TXN-DEMO-9996: Successful Recovery Candidate
  const demoRecoverable: RawTransactionInput = {
    transactionId: 'TXN-DEMO-9996',
    customerId: 'CUST-DEMO-04',
    customerName: 'Ananya Sharma',
    amount: 8500,
    timestamp: new Date(now - 2 * 3600 * 1000),
    paymentStatus: 'abandoned',
    failureReason: 'checkout_abandoned',
    retryCount: 0,
    customerHistory: {
      totalTransactions: 12,
      successfulTransactions: 11,
      totalSpend: 74000,
      averageOrderValue: 6727,
      daysSinceFirstTransaction: 190,
    },
    product: 'Developer API Credits Bundle',
    category: 'API',
    subscriptionStatus: null,
    checkoutActivity: {
      pagesViewed: 11,
      timeOnCheckout: 320,
      cartValue: 8500,
      abandonedAt: 'review_order',
    },
    leakageType: 'checkout_abandonment',
    riskScore: 28,
    riskLevel: 'low',
    recoveryProbability: 0.84,
    expectedRecovery: 7140,
    interventionCost: 10,
    expectedNetRecovery: 7130,
    recommendedIntervention: null,
    recoveryStatus: 'pending',
    analysisTimestamp: null,
    seed: 9996,
  };

  transactions.push(demoBlocked, demoEscalated, demoStop, demoRecoverable);

  // Remaining transactions generated dynamically
  const remaining = count - transactions.length;

  for (let i = 0; i < remaining; i++) {
    const r = prng();
    let status: PaymentStatus;
    let failureReason: string | null = null;
    let retryCount = 0;

    // Realistic distribution:
    // 55% success
    // 18% failed
    // 12% abandoned
    // 7% subscription_failed
    // 5% overdue
    // 3% repeated_failure
    if (r < 0.55) {
      status = 'success';
    } else if (r < 0.73) {
      status = 'failed';
      failureReason = choice(FAILURE_REASONS);
      retryCount = randInt(0, 2);
    } else if (r < 0.85) {
      status = 'abandoned';
      failureReason = 'checkout_abandoned';
      retryCount = 0;
    } else if (r < 0.92) {
      status = 'subscription_failed';
      failureReason = choice(['insufficient_funds', 'card_expired', 'bank_timeout']);
      retryCount = randInt(1, 2);
    } else if (r < 0.97) {
      status = 'overdue';
      failureReason = 'invoice_unpaid';
      retryCount = randInt(0, 1);
    } else {
      status = 'repeated_failure';
      failureReason = choice(['card_declined_temporary', 'insufficient_funds', 'do_not_honour']);
      retryCount = randInt(3, 5);
    }

    const prod = choice(PRODUCTS);
    // Amount variation around basePrice +/- 40%
    const priceVariance = 0.6 + prng() * 0.8;
    const amount = Math.round(prod.basePrice * priceVariance);

    const custTotalTx = randInt(1, 35);
    const successfulTx = status === 'success' ? randInt(1, custTotalTx) : randInt(0, custTotalTx - 1);
    const avgSpend = Math.round(amount * (0.8 + prng() * 0.4));
    const totalSpend = successfulTx * avgSpend;

    // Timestamp between 1 hour and 14 days ago
    const hoursAgo = randInt(1, 336);
    const timestamp = new Date(now - hoursAgo * 3600 * 1000);

    const customerName = `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`;
    const customerId = `CUST-${randInt(1000, 9999)}`;
    const transactionId = `TXN-${(100000 + i).toString()}`;

    const tx: RawTransactionInput = {
      transactionId,
      customerId,
      customerName,
      amount,
      timestamp,
      paymentStatus: status,
      failureReason,
      retryCount,
      customerHistory: {
        totalTransactions: custTotalTx,
        successfulTransactions: successfulTx,
        totalSpend,
        averageOrderValue: avgSpend,
        daysSinceFirstTransaction: randInt(15, 600),
      },
      product: prod.name,
      category: prod.category,
      subscriptionStatus: status === 'subscription_failed' ? 'paused' : (prng() > 0.6 ? 'active' : null),
      checkoutActivity: {
        pagesViewed: randInt(1, 14),
        timeOnCheckout: randInt(20, 600),
        cartValue: amount,
        abandonedAt: status === 'abandoned' ? choice(['cart', 'address', 'payment_page', 'review_order']) : null,
      },
      leakageType: null,
      riskScore: 0,
      riskLevel: 'low',
      recoveryProbability: 0,
      expectedRecovery: 0,
      interventionCost: 0,
      expectedNetRecovery: 0,
      recommendedIntervention: null,
      recoveryStatus: status === 'success' ? 'recovered' : 'pending',
      analysisTimestamp: null,
      seed: initialSeed + i,
    };

    if (status !== 'success') {
      tx.leakageType = classifyLeakageType(tx as unknown as ITransaction);
      tx.recoveryProbability = calculateRecoveryProbability(tx as unknown as ITransaction);
      tx.riskScore = calculateRiskScore(tx as unknown as ITransaction);
      tx.riskLevel = getRiskLevel(tx.riskScore);
      tx.expectedRecovery = Math.round(tx.amount * tx.recoveryProbability);
      tx.expectedNetRecovery = tx.expectedRecovery;
    }

    transactions.push(tx);
  }

  return transactions;
}
