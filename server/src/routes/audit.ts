// ============================================================
// REVIVE X — Audit Trail Routes
// ============================================================
import { Router } from 'express';
import { queryAuditLog } from '../utils/audit.js';
import { validateQuery } from '../middleware/validate.js';
import { AuditFilterSchema } from '@revive-x/shared';

export const auditRouter = Router();

// ── GET /api/audit ─────────────────────────────────────────
auditRouter.get('/', validateQuery(AuditFilterSchema), async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      transactionId,
      eventType,
      actor,
      policyResult,
    } = req.query as any;

    const result = await queryAuditLog({
      page: Number(page),
      pageSize: Number(pageSize),
      transactionId,
      eventType,
      actor,
      policyResult,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
