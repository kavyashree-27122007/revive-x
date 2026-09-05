// ============================================================
// REVIVE X — Shared Zod Validation Schemas
// ============================================================
import { z } from 'zod';
import {
  LEAKAGE_TYPES,
  PAYMENT_STATUSES,
  INTERVENTION_TYPES,
  RECOVERY_STATUSES,
  POLICY_RESULTS,
  AUDIT_EVENT_TYPES,
  ACTORS,
} from '../constants/index.js';

// ── Customer History Schema ────────────────────────────────
export const CustomerHistorySchema = z.object({
  totalTransactions: z.number().int().min(0),
  successfulTransactions: z.number().int().min(0),
  totalSpend: z.number().min(0),
  averageOrderValue: z.number().min(0),
  daysSinceFirstTransaction: z.number().min(0),
});

// ── Checkout Activity Schema ───────────────────────────────
export const CheckoutActivitySchema = z.object({
  pagesViewed: z.number().int().min(0),
  timeOnCheckout: z.number().min(0),
  cartValue: z.number().min(0),
  abandonedAt: z.string().nullable(),
});

// ── Transaction Schema ─────────────────────────────────────
export const TransactionSchema = z.object({
  transactionId: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  amount: z.number().positive(),
  timestamp: z.string().datetime(),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  failureReason: z.string().nullable(),
  retryCount: z.number().int().min(0),
  customerHistory: CustomerHistorySchema,
  product: z.string().min(1),
  category: z.string().min(1),
  subscriptionStatus: z.enum(['active', 'paused', 'cancelled']).nullable(),
  checkoutActivity: CheckoutActivitySchema,
});

// ── Merchant Policy Schema ─────────────────────────────────
export const MerchantPolicySchema = z.object({
  maximumRetryAttempts: z.number().int().min(0).max(10),
  maximumDiscountPercentage: z.number().min(0).max(100),
  maximumContactAttempts: z.number().int().min(0).max(20),
  maximumRecoveryWindowHours: z.number().min(1).max(720),
  maximumAutonomousTransactionAmount: z.number().min(0),
  highValueEscalationThreshold: z.number().min(0),
  minimumRecoveryProbability: z.number().min(0).max(1),
  minimumExpectedNetRecovery: z.number(),
  allowedInterventionTypes: z.array(z.enum(INTERVENTION_TYPES)).min(1),
  allowIncentives: z.boolean(),
  requireApprovalForHighValue: z.boolean(),
});

// ── Recovery Execute Schema ────────────────────────────────
export const RecoveryExecuteSchema = z.object({
  transactionId: z.string().min(1),
  actionId: z.string().min(1),
});

// ── Recovery Simulate Schema ───────────────────────────────
export const RecoverySimulateSchema = z.object({
  transactionIds: z.array(z.string().min(1)).optional(),
  limit: z.number().int().min(1).max(10000).optional().default(1000),
});

// ── Paginate Query Schema ──────────────────────────────────
export const PaginateQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(500).optional().default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ── Revenue Risk Filter Schema ─────────────────────────────
export const RevenueRiskFilterSchema = PaginateQuerySchema.extend({
  leakageType: z.enum(LEAKAGE_TYPES).optional(),
  riskLevel: z.enum(['high', 'medium', 'low']).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  minRecoveryProbability: z.coerce.number().min(0).max(1).optional(),
  recoveryStatus: z.enum(RECOVERY_STATUSES).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ── Audit Filter Schema ────────────────────────────────────
export const AuditFilterSchema = PaginateQuerySchema.extend({
  transactionId: z.string().optional(),
  eventType: z.enum(AUDIT_EVENT_TYPES).optional(),
  actor: z.enum(ACTORS).optional(),
  policyResult: z.enum(POLICY_RESULTS).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ── Transaction Filter Schema ──────────────────────────────
export const TransactionFilterSchema = PaginateQuerySchema.extend({
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  customerId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
