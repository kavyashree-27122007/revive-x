// ============================================================
// REVIVE X — Backend Application Entry Point
// AI Revenue Recovery Intelligence & Orchestration
// ============================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, getDbStatus } from './config/db.js';
import { initRazorpay, getRazorpayMode } from './config/razorpay.js';
import { createAIProvider, getAIProvider } from './engines/aiProvider.js';
import { dashboardRouter } from './routes/dashboard.js';
import { transactionsRouter } from './routes/transactions.js';
import { recoveryRouter } from './routes/recovery.js';
import { policiesRouter } from './routes/policies.js';
import { auditRouter } from './routes/audit.js';
import { demoRouter } from './routes/demo.js';
import { webhooksRouter } from './routes/webhooks.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generateSyntheticDataset } from './engines/datasetGenerator.js';
import { inMemoryTransactions } from './engines/recoveryOrchestrator.js';
import { TransactionModel } from './models/Transaction.js';
import { isMongoConnected } from './config/db.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature'],
}));

// Express raw body parser for webhooks signature check, and json parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  const db = getDbStatus();
  const razorpay = getRazorpayMode();
  const ai = getAIProvider().getProviderName();

  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: db,
        ai,
        razorpay,
      },
      version: '1.0.0',
    },
  });
});

// Mount Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/revenue-risk', transactionsRouter);
app.use('/api/recovery', recoveryRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/demo', demoRouter);
app.use('/api/webhooks', webhooksRouter);


// Serve frontend static assets & SPA fallback (Single-service deployment on Render)
const clientDistPath = path.resolve(__dirname, '../../client/dist');


if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Server Initialization
async function startServer() {
  try {
    // 1. Connect Database (with fallback)
    await connectDatabase();

    // 2. Initialize Razorpay Client / Mock Mode
    initRazorpay();

    // 3. Initialize AI Provider (Gemini with fallback)
    await createAIProvider();

    // 4. Pre-seed default dataset if completely empty
    try {
      let count = 0;
      if (isMongoConnected()) {
        count = await TransactionModel.countDocuments();
      } else {
        count = inMemoryTransactions.size;
      }

      if (count === 0) {
        console.info('[Init] No transactions found. Auto-seeding initial 1,000 demo transactions...');
        const initialSeed = generateSyntheticDataset(1000, 42);
        if (isMongoConnected()) {
          await TransactionModel.insertMany(initialSeed);
        } else {
          for (const tx of initialSeed) {
            inMemoryTransactions.set(tx.transactionId, tx);
          }
        }
        console.info('[Init] Demo transactions successfully seeded.');
      }
    } catch (e) {
      console.warn('[Init] Auto-seeding skipped or encountered non-critical error:', e);
    }

    app.listen(PORT, () => {
      console.info(`====================================================`);
      console.info(`  REVIVE X Backend Server running on port ${PORT}   `);
      console.info(`  Database Mode: ${getDbStatus()}                   `);
      console.info(`  Razorpay Mode: ${getRazorpayMode()}               `);
      console.info(`  AI Provider:   ${getAIProvider().getProviderName()}`);
      console.info(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
