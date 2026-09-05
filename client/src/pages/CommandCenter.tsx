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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899'];

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

  const interventionChartData = summary?.interventionDistribution
    ? Object.entries(summary.interventionDistribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        count: value,
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
      {/* Top Banner & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 backdrop-blur-md">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
            Recovery Decision & Orchestration
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Revenue Recovery Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Optimizing Expected Net Recovery across {summary?.totalTransactions || 0} processed transactions using automated probability scoring and Guardian policy guardrails.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50 shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isAnalyzing ? 'Analyzing Pipeline...' : 'RUN RECOVERY ANALYSIS'}</span>
        </button>
      </div>

      {/* Top 6 KPI Cards */}
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
          color="blue"
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
          subtitle="After intervention costs"
          icon={Calculator}
          color="purple"
        />
        <KPICard
          title="Recovery Rate"
          value={formatPercent(summary?.recoveryRate)}
          subtitle="Of at-risk revenue"
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
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#121826]/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Leakage vs. Recovered Trend</h3>
              <p className="text-xs text-slate-400">Weekly comparison of detected risk vs recovered revenue</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                At Risk
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Recovered
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="atRisk" stroke="#F43F5E" fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered" stroke="#10B981" fillOpacity={1} fill="url(#colorRecovered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leakage Distribution Donut */}
        <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-1">Leakage by Failure Type</h3>
          <p className="text-xs text-slate-400 mb-4">Root causes contributing to lost revenue</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leakageChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leakageChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {leakageChartData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                <span className="truncate capitalize">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Recoverable Transactions Table */}
      <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Top Recoverable Transactions</h3>
            <p className="text-xs text-slate-400">Prioritized by Expected Net Recovery</p>
          </div>
          <a
            href="/radar"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All in Radar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Transaction</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Leakage Type</th>
                <th className="pb-3 font-semibold">Recovery Prob.</th>
                <th className="pb-3 font-semibold">Expected Net</th>
                <th className="pb-3 font-semibold">Recommended Action</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topTx.map((tx) => (
                <tr key={tx.transactionId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono font-bold text-blue-400">{tx.transactionId}</td>
                  <td className="py-3 text-slate-200">{tx.customerName}</td>
                  <td className="py-3 font-bold text-white">{formatINR(tx.amount)}</td>
                  <td className="py-3 capitalize text-slate-300">
                    {tx.leakageType ? tx.leakageType.replace(/_/g, ' ') : '—'}
                  </td>
                  <td className="py-3 font-semibold text-blue-400">
                    {formatPercent(tx.recoveryProbability * 100)}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    {formatINR(tx.expectedNetRecovery || tx.amount * 0.7)}
                  </td>
                  <td className="py-3 uppercase font-mono text-[10px] text-slate-300">
                    {tx.recommendedIntervention || 'delayed_retry'}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={tx.recoveryStatus || 'pending'} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-500/30"
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
