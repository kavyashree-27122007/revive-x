import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  AlertOctagon,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIDecisionDrawer } from '../components/decisions/AIDecisionDrawer';
import { formatINR, formatPercent } from '../lib/format';
import { api } from '../lib/api';

export const AIDecisions: React.FC = () => {
  const [demoCases, setDemoCases] = useState<any[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const loadDecisions = async () => {
    try {
      const [blocked, escalated, stop, recoverable, list] = await Promise.all([
        api.getTransaction('TXN-DEMO-9999').catch(() => null),
        api.getTransaction('TXN-DEMO-9998').catch(() => null),
        api.getTransaction('TXN-DEMO-9997').catch(() => null),
        api.getTransaction('TXN-DEMO-9996').catch(() => null),
        api.getRiskEvents({ pageSize: 10 }),
      ]);

      const demos = [
        blocked?.transaction,
        escalated?.transaction,
        stop?.transaction,
        recoverable?.transaction,
      ].filter(Boolean);

      setDemoCases(demos);
      setRecentDecisions(list?.items || []);
    } catch (err) {
      console.error('Failed to load decisions:', err);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          <span>Explainable AI Decisions</span>
        </h2>
        <p className="text-xs text-slate-400">
          Every financial recommendation is derived from deterministic probability models, cost-benefit optimization, and strict Guardian policy checks.
        </p>
      </div>

      {/* Flagship Hackathon Presentation Scenarios */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200">
            Critical Hackathon Verification Scenarios
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scenario 1: Blocked Policy Violation */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9999');
              if (tx) setSelectedTx(tx);
            }}
            className="p-5 rounded-xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-500/30 cursor-pointer hover:border-rose-500/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-rose-400">TXN-DEMO-9999</span>
              <StatusBadge status="blocked" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
              Guardian Policy Block: 25% Discount Violation
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Amount: <strong className="text-white">₹32,000</strong>. AI proposed a 25% incentive. Guardian detected violation of <strong>10% maximum discount</strong> limit, blocked the action, and autonomously selected <strong>Delayed Retry</strong>.
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-rose-400 font-semibold">Click to Inspect & Audit</span>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario 2: High Value Escalation */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9998');
              if (tx) setSelectedTx(tx);
            }}
            className="p-5 rounded-xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-500/30 cursor-pointer hover:border-amber-500/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">TXN-DEMO-9998</span>
              <StatusBadge status="escalated" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              High-Value Escalation Threshold Exceeded
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Amount: <strong className="text-white">₹45,000</strong>. Exceeds the autonomous execution limit of <strong>₹10,000</strong>. Guardian prevents automated recovery and routes to human operator review.
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-amber-400 font-semibold">Click to Inspect & Audit</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario 3: Autonomous STOP Decision */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9997');
              if (tx) setSelectedTx(tx);
            }}
            className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 cursor-pointer hover:border-slate-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400">TXN-DEMO-9997</span>
              <StatusBadge status="stopped" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-slate-300 transition-colors">
              Autonomous STOP: Exhausted & Uneconomical
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Age: <strong>75 hours</strong> (exceeds 48h window), 4 retries failed, recovery probability is <strong>8%</strong>. AI terminates recovery to protect customer relationship and avoid wasteful retries.
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-semibold">Click to Inspect & Audit</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario 4: Successful Recovery Candidate */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9996');
              if (tx) setSelectedTx(tx);
            }}
            className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 cursor-pointer hover:border-emerald-500/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">TXN-DEMO-9996</span>
              <StatusBadge status="approved" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Optimal Strategy: Checkout Abandonment Recovery
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Amount: <strong className="text-white">₹8,500</strong>. High buyer intent (11 pages viewed). Recovery Probability: <strong>84%</strong>. AI selected <strong>Payment Link</strong> with expected net recovery of <strong>₹7,130</strong>.
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-emerald-400 font-semibold">Click to Execute Recovery</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Transaction AI Decision Drawer */}
      {selectedTx && (
        <AIDecisionDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onExecutionComplete={loadDecisions}
        />
      )}
    </div>
  );
};
