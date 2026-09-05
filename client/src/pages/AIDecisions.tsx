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
      {/* Header with AI Violet Accent */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-50 border border-violet-200">
            <BrainCircuit className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Explainable AI Decision Audit
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic probability modeling, mathematical cost-benefit optimization, and strict Guardian policy safety.
            </p>
          </div>
        </div>
      </div>

      {/* Flagship Verification Scenarios */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Critical Verification Scenarios
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Scenario 1: Blocked Policy Violation (Visually impressive high-contrast blocked card) */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9999');
              if (tx) setSelectedTx(tx);
            }}
            className="p-6 rounded-2xl bg-white border-2 border-rose-300/80 shadow-md hover:shadow-xl hover:border-rose-400 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full pointer-events-none -z-0" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  TXN-DEMO-9999
                </span>
                <StatusBadge status="blocked" />
              </div>

              <h4 className="text-base font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                Guardian Policy Block: 25% Discount Violation
              </h4>

              <div className="my-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-800">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>GUARDIAN SAFETY TRIPPED</span>
                </div>
                AI suggested a 25% discount. Guardian detected a hard violation of merchant's <strong>10% max incentive cap</strong>, blocked the action, and safely converted to <strong>Delayed Retry</strong>.
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Transaction Value: <strong className="text-slate-900">₹32,000</strong>. Zero unauthorized merchant margin burned.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs relative z-10">
              <span className="text-rose-700 font-bold">Inspect Decision Reasoning</span>
              <ArrowRight className="w-4 h-4 text-rose-600 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Scenario 2: High Value Escalation */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9998');
              if (tx) setSelectedTx(tx);
            }}
            className="p-6 rounded-2xl bg-white border border-amber-300 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  TXN-DEMO-9998
                </span>
                <StatusBadge status="escalated" />
              </div>

              <h4 className="text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                High-Value Escalation Threshold Exceeded
              </h4>

              <div className="my-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>HUMAN SIGN-OFF REQUIRED</span>
                </div>
                Amount: <strong className="text-slate-900">₹45,000</strong>. Exceeds the autonomous limit of <strong>₹10,000</strong>. Guardian prevents automated recovery and routes to human merchant sign-off.
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents accidental automated refunds or unmonitored VIP customer outreach.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-amber-700 font-bold">Inspect Escalation Path</span>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Scenario 3: Autonomous STOP Decision */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9997');
              if (tx) setSelectedTx(tx);
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  TXN-DEMO-9997
                </span>
                <StatusBadge status="stopped" />
              </div>

              <h4 className="text-base font-black text-slate-900 group-hover:text-slate-700 transition-colors">
                Autonomous STOP: Uneconomical & Customer Protection
              </h4>

              <div className="my-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-800">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>RECOVERY CEASED</span>
                </div>
                Age: <strong>75 hours</strong> (exceeds 48h limit). 4 retries already failed; probability is <strong>8%</strong>. AI terminates recovery to protect customer relationship and bank score.
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents merchant from appearing spammy or incurring wasted payment attempt fees.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-700 font-bold">Inspect Termination Logic</span>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Scenario 4: Successful Recovery Candidate */}
          <div
            onClick={() => {
              const tx = demoCases.find((d) => d.transactionId === 'TXN-DEMO-9996');
              if (tx) setSelectedTx(tx);
            }}
            className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  TXN-DEMO-9996
                </span>
                <StatusBadge status="approved" />
              </div>

              <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                Optimal Strategy: Abandoned Checkout Recovery
              </h4>

              <div className="my-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OPTIMAL RECOVERY APPROVED</span>
                </div>
                Amount: <strong className="text-slate-900">₹8,500</strong>. High buyer intent (11 pages viewed). Recovery Probability: <strong>84%</strong>. AI generated Payment Link with net expected return of <strong>₹7,130</strong>.
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Fully automated, policy-compliant recovery ready for instant execution.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-emerald-700 font-bold">Execute Recovery Action</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1.5 transition-transform" />
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
