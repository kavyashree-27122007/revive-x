import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Percent,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatINR, formatPercent } from '../lib/format';
import { api } from '../lib/api';

export const RecoverySimulator: React.FC = () => {
  const [simulation, setSimulation] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [sampleLimit, setSampleLimit] = useState(2000);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateRecovery(sampleLimit);
      setSimulation(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const strategies = simulation?.strategies || [];
  const aiStrategy = strategies.find((s: any) => s.isAISelected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">What-If Recovery Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and compare 5 distinct recovery strategies across{' '}
            <strong className="text-white">{simulation?.transactionsAnalyzed || 0}</strong> at-risk transactions{' '}
            (<strong className="text-white">{formatINR(simulation?.revenueAtRisk || 0)}</strong> revenue at risk).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sampleLimit}
            onChange={(e) => setSampleLimit(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value={500}>500 Transactions</option>
            <option value={1000}>1,000 Transactions</option>
            <option value={2000}>2,000 Transactions</option>
            <option value={5000}>5,000 Transactions</option>
          </select>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing Simulation...' : 'Re-Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* AI Recommendation Highlight Box */}
      {aiStrategy && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  AI Recommended Strategy
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {aiStrategy.label}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Unlike blanket retry or spam reminder approaches, Smart Segmented Recovery evaluates each transaction independently. It balances expected recovery probability against customer annoyance and intervention costs, yielding the highest net recovery of{' '}
                  <strong className="text-emerald-400">{formatINR(aiStrategy.netRecoveredRevenue)}</strong> with{' '}
                  <strong className="text-white">{aiStrategy.policyViolations} policy violations</strong>.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 block">Expected Net Recovery</span>
              <span className="text-2xl font-black text-emerald-400">
                {formatINR(aiStrategy.netRecoveredRevenue)}
              </span>
              <span className="text-xs font-semibold text-blue-400 block mt-0.5">
                {formatPercent(aiStrategy.recoveryRate)} Recovery Rate
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Comparison Matrix Table */}
      <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800 overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-1">Live Multi-Strategy Comparison</h3>
        <p className="text-xs text-slate-400 mb-4">
          All values dynamically calculated from the loaded dataset using mathematical expected value formulas.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Strategy</th>
                <th className="pb-3 font-semibold text-right">Expected Recovered</th>
                <th className="pb-3 font-semibold text-right">Intervention Cost</th>
                <th className="pb-3 font-semibold text-right">Net Recovered</th>
                <th className="pb-3 font-semibold text-right">Recovery Rate</th>
                <th className="pb-3 font-semibold text-center">Customer Contacts</th>
                <th className="pb-3 font-semibold text-center">Policy Violations</th>
                <th className="pb-3 font-semibold text-center">Risk Level</th>
                <th className="pb-3 font-semibold text-center">AI Choice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {strategies.map((st: any) => {
                const isSelected = st.isAISelected;
                return (
                  <tr
                    key={st.strategyId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-600/10 hover:bg-blue-600/15 border-l-4 border-l-blue-500'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {isSelected && <Zap className="w-4 h-4 text-blue-400 fill-current" />}
                        <span>{st.label}</span>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-right text-slate-200">
                      {formatINR(st.expectedRecoveredRevenue)}
                    </td>
                    <td className="py-4 text-right text-slate-400 font-mono">
                      {formatINR(st.interventionCost)}
                    </td>
                    <td className="py-4 font-black text-right text-emerald-400 text-sm">
                      {formatINR(st.netRecoveredRevenue)}
                    </td>
                    <td className="py-4 text-right font-bold text-blue-400">
                      {formatPercent(st.recoveryRate)}
                    </td>
                    <td className="py-4 text-center text-slate-300 font-mono">
                      {st.customerContactCount}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          st.policyViolations > 0
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {st.policyViolations}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          st.riskLevel === 'high'
                            ? 'bg-rose-500/20 text-rose-400'
                            : st.riskLevel === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {st.riskLevel}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500 text-white shadow-md shadow-blue-500/30">
                          <CheckCircle className="w-3 h-3" />
                          <span>OPTIMAL</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Takeaway Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">The REVIVE X Differentiator:</strong> Blanket retries trigger bank flags and customer irritation; blanket incentives burn merchant margin. Smart Segmented Recovery maximizes net cash captured while respecting every merchant guardrail constraint.
        </div>
      </div>
    </div>
  );
};
