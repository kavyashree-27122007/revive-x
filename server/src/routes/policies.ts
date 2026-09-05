// ============================================================
// REVIVE X — Merchant Policy Configuration Routes
// ============================================================
import { Router } from 'express';
import {
  MerchantPolicyModel,
  getOrCreateDefaultPolicy,
} from '../models/MerchantPolicy.js';
import { isMongoConnected } from '../config/db.js';
import { createAuditEntry } from '../utils/audit.js';
import { validateBody } from '../middleware/validate.js';
import { MerchantPolicySchema, DEFAULT_POLICY } from '@revive-x/shared';

export const policiesRouter = Router();

// In-memory policy fallback
let inMemoryPolicy: any = {
  merchantId: 'default',
  ...DEFAULT_POLICY,
  updatedAt: new Date().toISOString(),
};

export function getLocalPolicy() {
  return inMemoryPolicy;
}

// ── GET /api/policies ─────────────────────────────────────
policiesRouter.get('/', async (_req, res, next) => {
  try {
    if (isMongoConnected()) {
      const policy = await getOrCreateDefaultPolicy();
      return res.json({
        success: true,
        data: policy,
      });
    }

    return res.json({
      success: true,
      data: inMemoryPolicy,
    });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/policies ─────────────────────────────────────
policiesRouter.put('/', validateBody(MerchantPolicySchema), async (req, res, next) => {
  try {
    const updates = req.body;

    await createAuditEntry({
      transactionId: 'POLICY-GLOBAL',
      eventType: 'POLICY_UPDATED',
      actor: 'MERCHANT',
      action: 'Update merchant recovery guardrails',
      reason: 'Merchant modified policy thresholds & allowed interventions',
      amount: 0,
      status: 'UPDATED',
      metadata: updates,
    });

    if (isMongoConnected()) {
      const policy = await MerchantPolicyModel.findOneAndUpdate(
        { merchantId: 'default' },
        { ...updates, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      inMemoryPolicy = policy.toObject();
      return res.json({
        success: true,
        data: policy,
      });
    }

    inMemoryPolicy = {
      ...inMemoryPolicy,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: inMemoryPolicy,
    });
  } catch (error) {
    next(error);
  }
});
