// ============================================================
// REVIVE X — RecoveryAction Mongoose Model
// ============================================================
import mongoose, { Schema, Document } from 'mongoose';
import type { InterventionType, PolicyResult } from '@revive-x/shared';

export interface IRecoveryAction extends Document {
  actionId: string;
  transactionId: string;
  interventionType: InterventionType;
  proposedBy: 'gemini' | 'deterministic_engine';
  policyResult: PolicyResult;
  policyViolations: string[];
  expectedNetRecovery: number;
  interventionCost: number;
  proposedDiscountPct: number;
  executedAt: Date | null;
  resultStatus: 'success' | 'failed' | 'pending' | null;
  razorpayOrderId: string | null;
  isMockExecution: boolean;
  explanation: string;
  alternativeChosen: boolean;
  originalBlockedIntervention: InterventionType | null;
  createdAt: Date;
  updatedAt: Date;
}

const RecoveryActionSchema = new Schema<IRecoveryAction>(
  {
    actionId: { type: String, required: true, unique: true, index: true },
    transactionId: { type: String, required: true, index: true },
    interventionType: {
      type: String,
      required: true,
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
    },
    proposedBy: {
      type: String,
      required: true,
      enum: ['gemini', 'deterministic_engine'],
    },
    policyResult: {
      type: String,
      required: true,
      enum: ['approved', 'blocked', 'escalated', 'stopped'],
    },
    policyViolations: { type: [String], default: [] },
    expectedNetRecovery: { type: Number, required: true, default: 0 },
    interventionCost: { type: Number, required: true, min: 0, default: 0 },
    proposedDiscountPct: { type: Number, required: true, min: 0, max: 100, default: 0 },
    executedAt: { type: Date, default: null },
    resultStatus: {
      type: String,
      enum: ['success', 'failed', 'pending', null],
      default: null,
    },
    razorpayOrderId: { type: String, default: null },
    isMockExecution: { type: Boolean, required: true, default: true },
    explanation: { type: String, required: true },
    alternativeChosen: { type: Boolean, required: true, default: false },
    originalBlockedIntervention: {
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
  },
  { timestamps: true }
);

RecoveryActionSchema.index({ transactionId: 1, createdAt: -1 });

export const RecoveryActionModel = mongoose.model<IRecoveryAction>(
  'RecoveryAction',
  RecoveryActionSchema
);
