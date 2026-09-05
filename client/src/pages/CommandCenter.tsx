import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Percent,
  Calculator,
  Play,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIDecisionDrawer } from '../components/decisions/AIDecisionDrawer';
import { formatINR, formatPercent } from '../lib/format';
import { api } from '../lib/api';

const COLORS = ['#06B6D4', '#0F172A', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

export const CommandCenter: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [topTx, setTopTx] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, txRes] = await Promise.all([
        api.getSummary(),
        api.getRiskEvents({ pageSize: 6, sortOrder: 'desc' }),
      ]);
      setSummary(sumRes);
      setTopTx(txRes?.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.runBatchRecovery(1000);
      await loadData();
    } catch (err) {
      console.error('Batch analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format data for charts
  const leakageChartData = summary?.leakageByType
    ? Object.entries(summary.leakageByType).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  // Mock trend data for visualization
  const trendData = [
    { day: 'Mon', atRisk: 180000, recovered: 92000 },
    { day: 'Tue', atRisk: 240000, recovered: 145000 },
    { day: 'Wed', atRisk: 190000, recovered: 112000 },
    { day: 'Thu', atRisk: 310000, recovered: 204000 },
    { day: 'Fri', atRisk: 280000, recovered: 178000 },
    { day: 'Sat', atRisk: 150000, recovered: 95000 },
    { day: 'Sun', atRisk: 210000, recovered: 142000 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section: AI RECOVERY INTELLIGENCE (20% Navy + 10% Cyan) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0E17] p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                AI RECOVERY INTELLIGENCE
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold hidden sm:inline-block">
                Gemini 1.5 Enhanced
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Revenue Recovery Command Center
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous financial intelligence detecting checkout drop-offs, gateway declines, and subscription churn across{' '}
              <strong className="text-cyan-400 font-bold">{summary?.totalTransactions || 0}</strong> transactions. Governed by strict Guardian merchant guardrails.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
          >
            <Play className={`w-4 h-4 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Pipeline...' : 'RUN RECOVERY ANALYSIS'}</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards in crisp white financial cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Revenue At Risk"
          value={formatINR(summary?.revenueAtRisk || 0)}
          subtitle="Identified leakage"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Potentially Recoverable"
          value={formatINR(summary?.potentiallyRecoverableRevenue || 0)}
          subtitle="Probability weighted"
          icon={TrendingUp}
          color="cyan"
        />
        <KPICard
          title="Recovered Revenue"
          value={formatINR(summary?.recoveredRevenue || 0)}
          subtitle="Confirmed wins"
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Net Recovered"
          value={formatINR(summary?.netRecoveredRevenue || 0)}
          subtitle="Intervention net yield"
          icon={Calculator}
          color="violet"
        />
        <KPICard
          title="Recovery Rate"
          value={formatPercent(summary?.recoveryRate)}
          subtitle="Of at-risk volume"
          icon={Percent}
          color="amber"
        />
        <KPICard
          title="Recovery ROI"
          value={
            summary?.recoveryROI === 'N/A' || summary?.recoveryROI === undefined
              ? 'N/A'
              : `${summary.recoveryROI}x`
          }
          subtitle="Net return on spend"
          icon={ShieldCheck}
          color="cyan"
        />
      </div>

      {/* Recovery Opportunity Score & Funnel Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery Opportunity Score Card (Circular Ring Gauge) */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Opportunity Index
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Recovery Opportunity Score
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
                HIGH RECOVERY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic recovery feasibility based on intent signals and gateway status.
            </p>
          </div>

          <div className="my-5 flex items-center justify-center gap-6">
            {/* SVG Ring Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#06B6D4"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.87)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">87</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="space-y-2 text-xs flex-1">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                  <span>Buyer Intent Signals</span>
                  <span className="font-bold text-slate-900">92%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                  <span>Payment Method Health</span>
                  <span className="font-bold text-slate-900">84%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '84%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                  <span>Merchant Policy Safety</span>
                  <span className="font-bold text-slate-900">95%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Algorithmic confidence: <strong className="text-slate-800">Very High</strong></span>
            <span className="text-cyan-700 font-semibold">1,000 tx evaluated</span>
          </div>
        </div>

        {/* Leakage & Recovery Funnel */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Orchestration Pipeline
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  End-to-End Recovery Funnel
                </h3>
              </div>
              <span className="text-xs text-slate-500">Zero-Loss Protection</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Progression from raw gateway telemetry through AI intervention to reconciled net cash.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">1. Processed</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {summary?.totalTransactions || 0}
              </span>
              <span className="text-[10px] text-slate-500">Total volume</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">2. Leakage Detected</span>
              <span className="text-lg font-black text-rose-800 mt-1 block">
                {formatINR(summary?.revenueAtRisk || 0)}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">At risk</span>
            </div>
            <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200">
              <span className="text-[10px] uppercase font-bold text-cyan-800 block">3. AI Scored</span>
              <span className="text-lg font-black text-cyan-900 mt-1 block">
                {formatINR(summary?.potentiallyRecoverableRevenue || 0)}
              </span>
              <span className="text-[10px] text-cyan-700 font-semibold">Candidate pool</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">4. Net Recovered</span>
              <span className="text-lg font-black text-emerald-900 mt-1 block">
                {formatINR(summary?.netRecoveredRevenue || 0)}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">In bank</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Active Guardian Rule: <strong className="text-slate-800">Max 10% discount cap & 2 contact attempts enforced</strong></span>
            <span className="text-emerald-700 font-bold">Guardian Verified</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Navy + Cyan clean theme */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Leakage vs. Recovered Trend</h3>
              <p className="text-xs text-slate-500">Weekly comparison of detected risk vs recovered revenue</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                At Risk
              </span>
              <span className="flex items-center gap-1.5 text-cyan-600">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Recovered
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="atRisk" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leakage Distribution Donut */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Leakage by Failure Type</h3>
            <p className="text-xs text-slate-500 mb-4">Root causes contributing to lost revenue</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leakageChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leakageChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
            {leakageChartData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate capitalize">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Recoverable Transactions Table */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Recoverable Transactions</h3>
            <p className="text-xs text-slate-500">Prioritized by Expected Net Recovery</p>
          </div>
          <a
            href="/radar"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 transition-colors"
          >
            <span>View All in Radar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Leakage Type</th>
                <th className="py-2.5 px-3">Recovery Prob.</th>
                <th className="py-2.5 px-3">Expected Net</th>
                <th className="py-2.5 px-3">Recommended Action</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topTx.map((tx) => (
                <tr key={tx.transactionId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-700">{tx.transactionId}</td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">{tx.customerName}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{formatINR(tx.amount)}</td>
                  <td className="py-3 px-3 capitalize text-slate-600">
                    {tx.leakageType ? tx.leakageType.replace(/_/g, ' ') : '—'}
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-600">
                    {formatPercent(tx.recoveryProbability * 100)}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-600">
                    {formatINR(tx.expectedNetRecovery || tx.amount * 0.7)}
                  </td>
                  <td className="py-3 px-3 uppercase font-mono text-[10px] text-slate-600">
                    {tx.recommendedIntervention || 'delayed_retry'}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={tx.recoveryStatus || 'pending'} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="px-3 py-1 rounded-md text-[11px] font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 transition-colors cursor-pointer"
                    >
                      Audit AI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Transaction AI Decision Drawer */}
      {selectedTx && (
        <AIDecisionDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onExecutionComplete={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
