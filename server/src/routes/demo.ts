// ============================================================
// REVIVE X — Demo Dataset Management Routes
// Generates 10,000 synthetic transactions deterministically
// ============================================================
import { Router } from 'express';
import { generateSyntheticDataset } from '../engines/datasetGenerator.js';
import { TransactionModel } from '../models/Transaction.js';
import { RecoveryActionModel } from '../models/RecoveryAction.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { isMongoConnected } from '../config/db.js';
import { inMemoryTransactions, inMemoryActions } from '../engines/recoveryOrchestrator.js';
import { clearInMemoryAuditLog, createAuditEntry } from '../utils/audit.js';

export const demoRouter = Router();

// ── POST /api/demo/load ───────────────────────────────────
demoRouter.post('/load', async (req, res, next) => {
  try {
    const count = Number(req.body?.count) || 10000;
    console.info(`[Demo] Generating ${count} synthetic transactions...`);
    const transactions = generateSyntheticDataset(count, 42);

    if (isMongoConnected()) {
      await TransactionModel.deleteMany({});
      // Insert in batches of 2000 for efficiency
      const batchSize = 2000;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await TransactionModel.insertMany(batch);
      }
    } else {
      inMemoryTransactions.clear();
      for (const tx of transactions) {
        inMemoryTransactions.set(tx.transactionId, tx);
      }
    }

    await createAuditEntry({
      transactionId: 'DATASET-INIT',
      eventType: 'DEMO_DATA_LOADED',
      actor: 'SYSTEM',
      action: 'Load synthetic demo dataset',
      reason: `Successfully loaded ${count} seeded transactions for recovery simulation`,
      amount: 0,
      status: 'LOADED',
      metadata: { count },
    });

    console.info(`[Demo] Successfully loaded ${count} transactions.`);

    return res.json({
      success: true,
      data: {
        message: `Successfully loaded ${count} demo transactions.`,
        totalTransactions: count,
        atRiskSample: transactions.filter((t) => t.paymentStatus !== 'success').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/demo/reset ────────────────────────────────
demoRouter.delete('/reset', async (_req, res, next) => {
  try {
    if (isMongoConnected()) {
      await Promise.all([
        TransactionModel.deleteMany({}),
        RecoveryActionModel.deleteMany({}),
        AuditLogModel.deleteMany({}),
      ]);
    }

    inMemoryTransactions.clear();
    inMemoryActions.clear();
    clearInMemoryAuditLog();

    return res.json({
      success: true,
      data: {
        message: 'All demo data, actions, and audit logs have been reset.',
      },
    });
  } catch (error) {
    next(error);
  }
});
