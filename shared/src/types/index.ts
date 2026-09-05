// ============================================================
// REVIVE X — Shared TypeScript Types
// ============================================================

import type {
  LeakageType,
  PaymentStatus,
  InterventionType,
  RecoveryStatus,
  PolicyResult,
  AuditEventType,
  Actor,
  RiskLevel,
} from '../constants/index.js';

// ── Customer History ──────────────────────────────────────
export interface CustomerHistory {
  totalTransactions: number;
  successfulTransactions: number;
  totalSpend: number;         // INR
  averageOrderValue: number;  // INR
  daysSinceFirstTransaction: number;
}

// ── Checkout Activity ──────────────────────────────────────
export interface CheckoutActivity {
  pagesViewed: number;
  timeOnCheckout: number;    // seconds
  cartValue: number;         // INR
  abandonedAt: string | null; // e.g. "payment_page", "address_page"
}

// ── Transaction ────────────────────────────────────────────
export interface Transaction {
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;            // INR
  timestamp: string;         // ISO 8601
  paymentStatus: PaymentStatus;
  failureReason: string | null;
  retryCount: number;
  customerHistory: CustomerHistory;
  product: string;
  category: string;
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | null;
  checkoutActivity: CheckoutActivity;

  // Leakage / Risk
  leakageType: LeakageType | null;
  riskScore: number;          // 0-100
  riskLevel: RiskLevel;

  // Recovery Analysis
  recoveryProbability: number;    // 0-1
  expectedRecovery: number;       // INR = amount * recoveryProbability
  interventionCost: number;       // INR
  expectedNetRecovery: number;    // INR = expectedRecovery - interventionCost
  recommendedIntervention: InterventionType | null;
  recoveryStatus: RecoveryStatus;
  analysisTimestamp: string | null;

  // Metadata
  seed: number;
  createdAt: string;
  updatedAt: string;
}

// ── Recovery Action ────────────────────────────────────────
export interface RecoveryAction {
  actionId: string;
  transactionId: string;
  interventionType: InterventionType;
  proposedBy: 'gemini' | 'deterministic_engine';
  policyResult: PolicyResult;
  policyViolations: string[];
  expectedNetRecovery: number;    // INR
  interventionCost: number;       // INR
  proposedDiscountPct: number;    // 0-100 (for merchant_incentive)
  executedAt: string | null;
  resultStatus: 'success' | 'failed' | 'pending' | null;
  razorpayOrderId: string | null;
  isMockExecution: boolean;
  explanation: string;
  alternativeChosen: boolean;
  originalBlockedIntervention: InterventionType | null;
  createdAt: string;
}

// ── Audit Log Entry ───────────────────────────────────────
export interface AuditLogEntry {
  auditId: string;
  timestamp: string;         // ISO 8601
  transactionId: string;
  eventType: AuditEventType;
  actor: Actor;
  action: string;
  reason: string;
  policyResult: PolicyResult | null;
  amount: number;            // INR
  status: string;
  metadata?: Record<string, unknown>;
}

// ── Merchant Policy ────────────────────────────────────────
export interface MerchantPolicy {
  merchantId: string;
  maximumRetryAttempts: number;
  maximumDiscountPercentage: number;
  maximumContactAttempts: number;
  maximumRecoveryWindowHours: number;
  maximumAutonomousTransactionAmount: number;
  highValueEscalationThreshold: number;
  minimumRecoveryProbability: number;
  minimumExpectedNetRecovery: number;
  allowedInterventionTypes: InterventionType[];
  allowIncentives: boolean;
  requireApprovalForHighValue: boolean;
  updatedAt: string;
}

// ── Dashboard Summary ──────────────────────────────────────
export interface DashboardSummary {
  totalTransactions: number;
  revenueProcessed: number;          // INR — total amount of all transactions
  revenueAtRisk: number;             // INR — sum of at-risk transaction amounts
  potentiallyRecoverableRevenue: number; // INR — sum of expected recovery
  interventionsGenerated: number;
  interventionsApproved: number;
  interventionsBlocked: number;
  interventionsEscalated: number;
  interventionsStopped: number;
  recoveredRevenue: number;          // INR
  interventionCost: number;          // INR
  netRecoveredRevenue: number;       // INR
  recoveryRate: number | null;       // % or null if revenueAtRisk = 0
  recoveryROI: number | 'N/A';       // ratio or "N/A" if cost = 0
  leakageByType: Record<LeakageType, number>; // count per type
  interventionDistribution: Record<InterventionType, number>; // count per type
  lastAnalysisTimestamp: string | null;
}

// ── Intervention Candidate ────────────────────────────────
export interface InterventionCandidate {
  type: InterventionType;
  recoveryProbability: number;
  expectedRecovery: number;
  interventionCost: number;
  expectedNetRecovery: number;
  customerAnnoyanceRisk: number; // 0-1
  policyRisk: number;            // 0-1
  finalScore: number;
  discountPct: number;           // 0-100
}

// ── AI Analysis Result ─────────────────────────────────────
export interface AIAnalysis {
  transactionId: string;
  leakageType: LeakageType;
  riskScore: number;
  recoveryProbability: number;
  candidates: InterventionCandidate[];
  selectedIntervention: InterventionType;
  explanation: string;
  proposedBy: 'gemini' | 'deterministic_engine';
}

// ── Guardian Check Result ─────────────────────────────────
export interface GuardianCheckResult {
  result: PolicyResult;
  violations: string[];
  reason: string;
  alternativeIntervention: InterventionType | null;
}

// ── Recovery Simulation Result ────────────────────────────
export interface SimulationStrategy {
  strategyId: string;
  label: string;
  interventionType: InterventionType | 'smart_segmented';
  expectedRecoveredRevenue: number;
  interventionCost: number;
  netRecoveredRevenue: number;
  recoveryRate: number;
  customerContactCount: number;
  policyViolations: number;
  riskLevel: RiskLevel;
  isAISelected: boolean;
}

export interface SimulationResult {
  strategies: SimulationStrategy[];
  aiSelectedStrategyId: string;
  transactionsAnalyzed: number;
  revenueAtRisk: number;
}

// ── API Response Wrappers ──────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Pagination ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Health Check ───────────────────────────────────────────
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected' | 'in_memory';
    ai: 'gemini' | 'deterministic' | 'unavailable';
    razorpay: 'test_mode' | 'mock_mode';
  };
  version: string;
}
