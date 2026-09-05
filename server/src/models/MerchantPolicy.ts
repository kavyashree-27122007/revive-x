// ============================================================
// REVIVE X — MerchantPolicy Mongoose Model
// ============================================================
import mongoose, { Schema, Document } from 'mongoose';
import { DEFAULT_POLICY, type InterventionType } from '@revive-x/shared';

export interface IMerchantPolicy extends Document {
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
  updatedAt: Date;
}

const MerchantPolicySchema = new Schema<IMerchantPolicy>(
  {
    merchantId: { type: String, required: true, unique: true, index: true, default: 'default' },
    maximumRetryAttempts: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: DEFAULT_POLICY.maximumRetryAttempts,
    },
    maximumDiscountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: DEFAULT_POLICY.maximumDiscountPercentage,
    },
    maximumContactAttempts: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
      default: DEFAULT_POLICY.maximumContactAttempts,
    },
    maximumRecoveryWindowHours: {
      type: Number,
      required: true,
      min: 1,
      default: DEFAULT_POLICY.maximumRecoveryWindowHours,
    },
    maximumAutonomousTransactionAmount: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_POLICY.maximumAutonomousTransactionAmount,
    },
    highValueEscalationThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: DEFAULT_POLICY.highValueEscalationThreshold,
    },
    minimumRecoveryProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: DEFAULT_POLICY.minimumRecoveryProbability,
    },
    minimumExpectedNetRecovery: {
      type: Number,
      required: true,
      default: DEFAULT_POLICY.minimumExpectedNetRecovery,
    },
    allowedInterventionTypes: {
      type: [String],
      enum: [
        'immediate_retry',
        'delayed_retry',
        'payment_reminder',
        'payment_link',
        'personalized_message',
        'merchant_incentive',
        'escalation',
        'stop',
      ],
      default: [...DEFAULT_POLICY.allowedInterventionTypes],
    },
    allowIncentives: { type: Boolean, required: true, default: DEFAULT_POLICY.allowIncentives },
    requireApprovalForHighValue: {
      type: Boolean,
      required: true,
      default: DEFAULT_POLICY.requireApprovalForHighValue,
    },
  },
  { timestamps: true }
);

export const MerchantPolicyModel = mongoose.model<IMerchantPolicy>(
  'MerchantPolicy',
  MerchantPolicySchema
);

import { isMongoConnected } from '../config/db.js';

const inMemoryFallbackPolicy: any = {
  merchantId: 'default',
  ...DEFAULT_POLICY,
  updatedAt: new Date(),
};

// Helper: get or create default policy
export async function getOrCreateDefaultPolicy(): Promise<IMerchantPolicy> {
  if (isMongoConnected()) {
    try {
      let policy = await MerchantPolicyModel.findOne({ merchantId: 'default' });
      if (!policy) {
        policy = await MerchantPolicyModel.create({ merchantId: 'default' });
      }
      return policy;
    } catch {
      // fallback
    }
  }
  return inMemoryFallbackPolicy as IMerchantPolicy;
}
