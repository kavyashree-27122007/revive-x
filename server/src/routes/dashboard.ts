// ============================================================
// REVIVE X — Dashboard Routes
// ============================================================
import { Router } from 'express';
import { getDashboardSummary } from '../engines/recoveryOrchestrator.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});
