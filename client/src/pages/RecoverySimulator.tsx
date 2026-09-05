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
            <SlidersHorizontal className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-black tracking-tight text-slate-900">What-If Recovery Simulator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate and mathematically benchmark 5 recovery strategies across{' '}
            <strong className="text-slate-900">{simulation?.transactionsAnalyzed || 0}</strong> at-risk transactions{' '}
            (<strong className="text-slate-900">{formatINR(simulation?.revenueAtRisk || 0)}</strong> volume at risk).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sampleLimit}
            onChange={(e) => setSampleLimit(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold shadow-xs"
          >
            <option value={500}>500 Transactions</option>
            <option value={1000}>1,000 Transactions</option>
            <option value={2000}>2,000 Transactions</option>
            <option value={5000}>5,000 Transactions</option>
          </select>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing...' : 'Re-Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* WOW Section: 5 Strategy Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Simulated Strategy Models (Live Monte Carlo Yields)
          </span>
          <span className="text-xs text-cyan-700 font-semibold">5 Concurrent Approaches</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {strategies.map((st: any) => {
            const isSelected = st.isAISelected;
            return (
              <div
                key={st.strategyId}
                className={`relative rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-50/70 via-white to-white border-2 border-cyan-400 shadow-lg -translate-y-1'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-xs mb-2">
                      ★ AI RECOMMENDED
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-400 bg-slate-50 mb-2">
                      Alternative Strategy
                    </span>
                  )}

                  <h4 className="text-xs font-black text-slate-900 line-clamp-2 min-h-[32px]">
                    {st.label}
                  </h4>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Net Recovered</span>
                      <span className={`text-base font-black ${isSelected ? 'text-cyan-700' : 'text-slate-900'}`}>
                        {formatINR(st.netRecoveredRevenue)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Recovery Rate:</span>
                      <span className="font-bold text-slate-800">{formatPercent(st.recoveryRate)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Cost:</span>
                      <span className="font-mono text-slate-600">{formatINR(st.interventionCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      st.policyViolations > 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {st.policyViolations > 0 ? `${st.policyViolations} Violations` : '0 Violations'}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase ${
                      st.riskLevel === 'high'
                        ? 'text-rose-600'
                        : st.riskLevel === 'medium'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {st.riskLevel} Risk
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendation Highlight Summary */}
      {aiStrategy && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131F37] to-slate-900 text-white shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  AI Mathematical Optimization Logic
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {aiStrategy.label}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Unlike blanket retry or spam reminder approaches, Smart Segmented Recovery evaluates each transaction independently. It balances expected recovery probability against customer annoyance and intervention costs, yielding the highest net recovery of{' '}
                  <strong className="text-emerald-400 font-bold">{formatINR(aiStrategy.netRecoveredRevenue)}</strong> with{' '}
                  <strong className="text-cyan-300 font-bold">{aiStrategy.policyViolations} policy violations</strong>.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">Optimal Net Recovery</span>
              <span className="text-2xl font-black text-emerald-400">
                {formatINR(aiStrategy.netRecoveredRevenue)}
              </span>
              <span className="text-xs font-bold text-cyan-400 block mt-0.5">
                {formatPercent(aiStrategy.recoveryRate)} Recovery Rate
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Comparison Matrix Table in clean white fintech layout */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <h3 className="text-sm font-bold text-slate-900 mb-0.5">Live Multi-Strategy Comparison Matrix</h3>
        <p className="text-xs text-slate-500 mb-4">
          All values dynamically calculated from the loaded dataset using mathematical expected value formulas.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3 text-right">Expected Recovered</th>
                <th className="py-2.5 px-3 text-right">Intervention Cost</th>
                <th className="py-2.5 px-3 text-right">Net Recovered</th>
                <th className="py-2.5 px-3 text-right">Recovery Rate</th>
                <th className="py-2.5 px-3 text-center">Customer Contacts</th>
                <th className="py-2.5 px-3 text-center">Policy Violations</th>
                <th className="py-2.5 px-3 text-center">Risk Level</th>
                <th className="py-2.5 px-3 text-center">AI Choice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {strategies.map((st: any) => {
                const isSelected = st.isAISelected;
                return (
                  <tr
                    key={st.strategyId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-cyan-50/60 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {isSelected && <Zap className="w-4 h-4 text-cyan-600 fill-current shrink-0" />}
                        <span>{st.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-right text-slate-800">
                      {formatINR(st.expectedRecoveredRevenue)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      {formatINR(st.interventionCost)}
                    </td>
                    <td className="py-3 px-3 font-black text-right text-emerald-600 text-sm">
                      {formatINR(st.netRecoveredRevenue)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-cyan-700">
                      {formatPercent(st.recoveryRate)}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 font-mono">
                      {st.customerContactCount}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          st.policyViolations > 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {st.policyViolations}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          st.riskLevel === 'high'
                            ? 'bg-rose-50 text-rose-700'
                            : st.riskLevel === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {st.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-600 text-white shadow-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>OPTIMAL</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
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
      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">The REVIVE X Differentiator:</strong> Blanket retries trigger bank flags and customer irritation; blanket incentives burn merchant margin. Smart Segmented Recovery maximizes net cash captured while respecting every merchant guardrail constraint.
        </div>
      </div>
    </div>
  );
};
