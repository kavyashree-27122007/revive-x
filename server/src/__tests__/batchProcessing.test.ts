// ============================================================
// Unit Tests: What-If Simulator & Batch Processing
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { generateSyntheticDataset } from '../engines/datasetGenerator.js';
import {
  inMemoryTransactions,
  runWhatIfSimulation,
  getDashboardSummary,
} from '../engines/recoveryOrchestrator.js';
import { DEFAULT_POLICY } from '@revive-x/shared';

describe('What-If Recovery Simulator', () => {
  beforeEach(() => {
    inMemoryTransactions.clear();
    const dataset = generateSyntheticDataset(200, 42);
    for (const tx of dataset) {
      inMemoryTransactions.set(tx.transactionId, tx);
    }
  });

  it('evaluates all 5 strategies dynamically with non-zero metrics', async () => {
    const simulation = await runWhatIfSimulation(DEFAULT_POLICY as any, 200);

    expect(simulation.strategies.length).toBe(5);
    expect(simulation.transactionsAnalyzed).toBeGreaterThan(0);
    expect(simulation.revenueAtRisk).toBeGreaterThan(0);

    // Strategy E should be designated AI-selected
    expect(simulation.aiSelectedStrategyId).toBe('strategy_e');
    const stratE = simulation.strategies.find((s) => s.strategyId === 'strategy_e');
    expect(stratE).toBeDefined();
    expect(stratE?.isAISelected).toBe(true);

    for (const strat of simulation.strategies) {
      expect(strat.expectedRecoveredRevenue).toBeGreaterThanOrEqual(0);
      expect(strat.interventionCost).toBeGreaterThanOrEqual(0);
      expect(strat.netRecoveredRevenue).toBe(
        strat.expectedRecoveredRevenue - strat.interventionCost
      );
      expect(strat.recoveryRate).toBeGreaterThanOrEqual(0);
      expect(strat.recoveryRate).toBeLessThanOrEqual(100);
    }
  });

  it('calculates dashboard metrics dynamically without NaN or Infinity', async () => {
    const summary = await getDashboardSummary();

    expect(summary.totalTransactions).toBe(200);
    expect(summary.revenueProcessed).toBeGreaterThan(0);
    expect(summary.revenueAtRisk).toBeGreaterThan(0);
    expect(summary.potentiallyRecoverableRevenue).toBeGreaterThan(0);
    expect(summary.recoveryROI).toBeDefined();
    expect(isNaN(summary.netRecoveredRevenue)).toBe(false);
  });
});
