// ============================================================
// REVIVE X — Transaction & Revenue-Risk Routes
// ============================================================
import { Router } from 'express';
import {
  getTransactionById,
  inMemoryTransactions,
} from '../engines/recoveryOrchestrator.js';
import { TransactionModel } from '../models/Transaction.js';
import { RecoveryActionModel } from '../models/RecoveryAction.js';
import { isMongoConnected } from '../config/db.js';
import { validateQuery } from '../middleware/validate.js';
import {
  TransactionFilterSchema,
  RevenueRiskFilterSchema,
} from '@revive-x/shared';

export const transactionsRouter = Router();

// ── GET /api/transactions ─────────────────────────────────
transactionsRouter.get('/', validateQuery(TransactionFilterSchema), async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      paymentStatus,
      minAmount,
      maxAmount,
      customerId,
      sortOrder = 'desc',
    } = req.query as any;

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    if (isMongoConnected()) {
      const filter: any = {};
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (customerId) filter.customerId = customerId;
      if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = Number(minAmount);
        if (maxAmount) filter.amount.$lte = Number(maxAmount);
      }

      const sort = { timestamp: sortOrder === 'asc' ? 1 : -1 };
      const [items, total] = await Promise.all([
        TransactionModel.find(filter).sort(sort as any).skip(skip).limit(limit).lean(),
        TransactionModel.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        data: {
          items,
          total,
          page: Number(page),
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // In-memory fallback
    let items = Array.from(inMemoryTransactions.values());
    if (paymentStatus) items = items.filter((t) => t.paymentStatus === paymentStatus);
    if (customerId) items = items.filter((t) => t.customerId === customerId);
    if (minAmount) items = items.filter((t) => t.amount >= Number(minAmount));
    if (maxAmount) items = items.filter((t) => t.amount <= Number(maxAmount));

    items.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: {
        items: paginated,
        total,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/revenue-risk ──────────────────────────────────
transactionsRouter.get('/risk-events', validateQuery(RevenueRiskFilterSchema), async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      leakageType,
      riskLevel,
      minAmount,
      maxAmount,
      minRecoveryProbability,
      recoveryStatus,
      sortOrder = 'desc',
    } = req.query as any;

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    if (isMongoConnected()) {
      const filter: any = { paymentStatus: { $ne: 'success' } };
      if (leakageType) filter.leakageType = leakageType;
      if (riskLevel) filter.riskLevel = riskLevel;
      if (recoveryStatus) filter.recoveryStatus = recoveryStatus;
      if (minRecoveryProbability) filter.recoveryProbability = { $gte: Number(minRecoveryProbability) };
      if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = Number(minAmount);
        if (maxAmount) filter.amount.$lte = Number(maxAmount);
      }

      const sort = { amount: sortOrder === 'asc' ? 1 : -1 };
      const [items, total] = await Promise.all([
        TransactionModel.find(filter).sort(sort as any).skip(skip).limit(limit).lean(),
        TransactionModel.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        data: {
          items,
          total,
          page: Number(page),
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // In-memory fallback
    let items = Array.from(inMemoryTransactions.values()).filter((t) => t.paymentStatus !== 'success');
    if (leakageType) items = items.filter((t) => t.leakageType === leakageType);
    if (riskLevel) items = items.filter((t) => t.riskLevel === riskLevel);
    if (recoveryStatus) items = items.filter((t) => t.recoveryStatus === recoveryStatus);
    if (minRecoveryProbability) items = items.filter((t) => t.recoveryProbability >= Number(minRecoveryProbability));
    if (minAmount) items = items.filter((t) => t.amount >= Number(minAmount));
    if (maxAmount) items = items.filter((t) => t.amount <= Number(maxAmount));

    items.sort((a, b) => (sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount));

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: {
        items: paginated,
        total,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/transactions/:id ─────────────────────────────
transactionsRouter.get('/:id', async (req, res, next) => {
  try {
    const tx = await getTransactionById(req.params.id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: `Transaction ${req.params.id} was not found.`,
        },
      });
    }

    // Fetch related recovery actions
    let actions: any[] = [];
    if (isMongoConnected()) {
      actions = await RecoveryActionModel.find({ transactionId: req.params.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    return res.json({
      success: true,
      data: {
        transaction: tx,
        actions,
      },
    });
  } catch (error) {
    next(error);
  }
});
