// ============================================================
// REVIVE X — Recovery Intelligence & Orchestration Routes
// ============================================================
import { Router } from 'express';
import { z } from 'zod';
import {
  analyzeTransaction,
  runBatchAnalysis,
  runWhatIfSimulation,
  executeRecovery,
  verifyRazorpayPayment,
} from '../engines/recoveryOrchestrator.js';
import { RecoveryActionModel } from '../models/RecoveryAction.js';
import { isMongoConnected } from '../config/db.js';
import { inMemoryActions } from '../engines/recoveryOrchestrator.js';
import { validateBody } from '../middleware/validate.js';
import {
  RecoveryExecuteSchema,
  RecoverySimulateSchema,
} from '@revive-x/shared';

export const recoveryRouter = Router();

// ── POST /api/recovery/analyze ────────────────────────────
const AnalyzeRequestSchema = z.object({
  transactionId: z.string().min(1),
});

recoveryRouter.post('/analyze', validateBody(AnalyzeRequestSchema), async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const result = await analyzeTransaction(transactionId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/recovery/run ────────────────────────────────
const BatchRunSchema = z.object({
  limit: z.number().int().min(1).max(10000).optional().default(2000),
});

recoveryRouter.post('/run', validateBody(BatchRunSchema), async (req, res, next) => {
  try {
    const { limit } = req.body;
    const result = await runBatchAnalysis(limit);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/recovery/simulate ───────────────────────────
recoveryRouter.post('/simulate', validateBody(RecoverySimulateSchema), async (req, res, next) => {
  try {
    const { limit } = req.body;
    const result = await runWhatIfSimulation(undefined, limit);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/recovery/execute ────────────────────────────
recoveryRouter.post('/execute', validateBody(RecoveryExecuteSchema), async (req, res, next) => {
  try {
    const { transactionId, actionId } = req.body;
    const result = await executeRecovery(transactionId, actionId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/recovery/results ─────────────────────────────
recoveryRouter.get('/results', async (_req, res, next) => {
  try {
    let actions: any[] = [];
    if (isMongoConnected()) {
      actions = await RecoveryActionModel.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    } else {
      actions = Array.from(inMemoryActions.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 100);
    }

    res.json({
      success: true,
      data: {
        total: actions.length,
        items: actions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/recovery/verify-payment ─────────────────────
const VerifyPaymentSchema = z.object({
  transactionId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

recoveryRouter.post('/verify-payment', validateBody(VerifyPaymentSchema), async (req, res, next) => {
  try {
    const { transactionId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const result = await verifyRazorpayPayment(
      transactionId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
