// ============================================================
// REVIVE X — Transaction Mongoose Model
// ============================================================
import mongoose, { Schema, Document } from 'mongoose';
import type {
  PaymentStatus,
  LeakageType,
  InterventionType,
  RecoveryStatus,
} from '@revive-x/shared';

export interface ITransaction extends Document {
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
  recommendedIntervention: InterventionType | null;
  recoveryStatus: RecoveryStatus;
  analysisTimestamp: Date | null;
  seed: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerHistorySchema = new Schema(
  {
    totalTransactions: { type: Number, required: true, min: 0 },
    successfulTransactions: { type: Number, required: true, min: 0 },
    totalSpend: { type: Number, required: true, min: 0 },
    averageOrderValue: { type: Number, required: true, min: 0 },
    daysSinceFirstTransaction: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CheckoutActivitySchema = new Schema(
  {
    pagesViewed: { type: Number, required: true, min: 0 },
    timeOnCheckout: { type: Number, required: true, min: 0 },
    cartValue: { type: Number, required: true, min: 0 },
    abandonedAt: { type: String, default: null },
  },
  { _id: false }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    timestamp: { type: Date, required: true },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['success', 'failed', 'abandoned', 'subscription_failed', 'overdue', 'repeated_failure'],
    },
    failureReason: { type: String, default: null },
    retryCount: { type: Number, required: true, min: 0, default: 0 },
    customerHistory: { type: CustomerHistorySchema, required: true },
    product: { type: String, required: true },
    category: { type: String, required: true },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'paused', 'cancelled', null],
      default: null,
    },
    checkoutActivity: { type: CheckoutActivitySchema, required: true },
    leakageType: {
      type: String,
      enum: [
        'payment_failure',
        'checkout_abandonment',
        'subscription_failure',
        'invoice_overdue',
        'repeated_failure',
        'high_value_at_risk',
        null,
      ],
      default: null,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100, default: 0 },
    riskLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'low',
    },
    recoveryProbability: { type: Number, min: 0, max: 1, default: 0 },
    expectedRecovery: { type: Number, min: 0, default: 0 },
    interventionCost: { type: Number, min: 0, default: 0 },
    expectedNetRecovery: { type: Number, default: 0 },
    recommendedIntervention: {
      type: String,
      enum: [
        'immediate_retry',
        'delayed_retry',
        'payment_reminder',
        'payment_link',
        'personalized_message',
        'merchant_incentive',
        'escalation',
        'stop',
        null,
      ],
      default: null,
    },
    recoveryStatus: {
      type: String,
      enum: [
        'pending',
        'analyzing',
        'approved',
        'blocked',
        'escalated',
        'executed',
        'recovered',
        'stopped',
        'failed',
      ],
      default: 'pending',
    },
    analysisTimestamp: { type: Date, default: null },
    seed: { type: Number, required: true },
  },
  { timestamps: true }
);

// Compound index for common filter queries
TransactionSchema.index({ paymentStatus: 1, timestamp: -1 });
TransactionSchema.index({ leakageType: 1, riskScore: -1 });
TransactionSchema.index({ recoveryStatus: 1, expectedNetRecovery: -1 });

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
