// ============================================================
// REVIVE X — AuditLog Mongoose Model
// ============================================================
import mongoose, { Schema, Document } from 'mongoose';
import type { AuditEventType, Actor, PolicyResult } from '@revive-x/shared';

export interface IAuditLog extends Document {
  auditId: string;
  timestamp: Date;
  transactionId: string;
  eventType: AuditEventType;
  actor: Actor;
  action: string;
  reason: string;
  policyResult: PolicyResult | null;
  amount: number;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, required: true, default: Date.now },
    transactionId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    actor: {
      type: String,
      required: true,
      enum: ['AI_ENGINE', 'GUARDIAN', 'MERCHANT', 'SYSTEM', 'RAZORPAY'],
    },
    action: { type: String, required: true },
    reason: { type: String, required: true },
    policyResult: {
      type: String,
      enum: ['approved', 'blocked', 'escalated', 'stopped', null],
      default: null,
    },
    amount: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ transactionId: 1, timestamp: 1 });
AuditLogSchema.index({ eventType: 1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
