// ============================================================
// REVIVE X — Shared Constants
// ============================================================

export const LEAKAGE_TYPES = [
  'payment_failure',
  'checkout_abandonment',
  'subscription_failure',
  'invoice_overdue',
  'repeated_failure',
  'high_value_at_risk',
] as const;

export type LeakageType = (typeof LEAKAGE_TYPES)[number];

export const PAYMENT_STATUSES = [
  'success',
  'failed',
  'abandoned',
  'subscription_failed',
  'overdue',
  'repeated_failure',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const INTERVENTION_TYPES = [
  'immediate_retry',
  'delayed_retry',
  'payment_reminder',
  'payment_link',
  'personalized_message',
  'merchant_incentive',
  'escalation',
  'stop',
] as const;

export type InterventionType = (typeof INTERVENTION_TYPES)[number];

export const RECOVERY_STATUSES = [
  'pending',
  'analyzing',
  'approved',
  'blocked',
  'escalated',
  'executed',
  'recovered',
  'stopped',
  'failed',
] as const;

export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

export const POLICY_RESULTS = ['approved', 'blocked', 'escalated', 'stopped'] as const;
export type PolicyResult = (typeof POLICY_RESULTS)[number];

export const AUDIT_EVENT_TYPES = [
  'REVENUE_RISK_DETECTED',
  'TRANSACTION_DIAGNOSED',
  'RECOVERY_PROBABILITY_CALCULATED',
  'INTERVENTIONS_EVALUATED',
  'AI_RECOMMENDATION_CREATED',
  'POLICY_CHECK',
  'ACTION_APPROVED',
  'ACTION_BLOCKED',
  'ACTION_ESCALATED',
  'ACTION_STOPPED',
  'ACTION_EXECUTED',
  'RESULT_RECEIVED',
  'RECOVERY_RECORDED',
  'DEMO_DATA_LOADED',
  'POLICY_UPDATED',
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export const ACTORS = ['AI_ENGINE', 'GUARDIAN', 'MERCHANT', 'SYSTEM', 'RAZORPAY'] as const;
export type Actor = (typeof ACTORS)[number];

// Intervention base costs in INR
export const INTERVENTION_COSTS: Record<InterventionType, number> = {
  immediate_retry: 0,
  delayed_retry: 0,
  payment_reminder: 5,
  payment_link: 10,
  personalized_message: 25,
  merchant_incentive: 0, // Calculated as % of amount
  escalation: 50,
  stop: 0,
};

// Default merchant policy values
export const DEFAULT_POLICY = {
  maximumRetryAttempts: 2,
  maximumDiscountPercentage: 10,
  maximumContactAttempts: 2,
  maximumRecoveryWindowHours: 48,
  maximumAutonomousTransactionAmount: 10000,
  highValueEscalationThreshold: 10000,
  minimumRecoveryProbability: 0.25,
  minimumExpectedNetRecovery: 0,
  allowedInterventionTypes: [...INTERVENTION_TYPES] as InterventionType[],
  allowIncentives: true,
  requireApprovalForHighValue: true,
} as const;

// Leakage type display labels
export const LEAKAGE_LABELS: Record<LeakageType, string> = {
  payment_failure: 'Payment Failure',
  checkout_abandonment: 'Checkout Abandonment',
  subscription_failure: 'Subscription Failure',
  invoice_overdue: 'Invoice Overdue',
  repeated_failure: 'Repeated Failure',
  high_value_at_risk: 'High Value At Risk',
};

// Risk level thresholds
export const RISK_THRESHOLDS = {
  high: 70,    // riskScore >= 70 → HIGH
  medium: 40,  // riskScore >= 40 → MEDIUM
  // below 40 → LOW
} as const;

export type RiskLevel = 'high' | 'medium' | 'low';

export function getRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= RISK_THRESHOLDS.high) return 'high';
  if (riskScore >= RISK_THRESHOLDS.medium) return 'medium';
  return 'low';
}
