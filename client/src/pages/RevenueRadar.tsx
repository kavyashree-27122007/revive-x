import React, { useEffect, useState } from 'react';
import { Filter, Search, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIDecisionDrawer } from '../components/decisions/AIDecisionDrawer';
import { formatINR, formatPercent, formatDate } from '../lib/format';
import { api } from '../lib/api';

export const RevenueRadar: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [leakageType, setLeakageType] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [recoveryStatus, setRecoveryStatus] = useState<string>('');

  const loadRiskEvents = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, pageSize: 25, sortOrder: 'desc' };
      if (leakageType) params.leakageType = leakageType;
      if (riskLevel) params.riskLevel = riskLevel;
      if (recoveryStatus) params.recoveryStatus = recoveryStatus;

      const res = await api.getRiskEvents(params);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load risk events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRiskEvents();
  }, [page, leakageType, riskLevel, recoveryStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Revenue Radar</h2>
          <p className="text-xs text-slate-400">
            Continuously tracking and scoring revenue-at-risk events across payments, checkouts, and invoices.
          </p>
        </div>
        <button
          onClick={loadRiskEvents}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Events</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#121826]/80 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        {/* Leakage Type Filter */}
        <select
          value={leakageType}
          onChange={(e) => {
            setLeakageType(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Leakage Types</option>
          <option value="payment_failure">Payment Failure</option>
          <option value="checkout_abandonment">Checkout Abandonment</option>
          <option value="subscription_failure">Subscription Failure</option>
          <option value="invoice_overdue">Invoice Overdue</option>
          <option value="repeated_failure">Repeated Failure</option>
          <option value="high_value_at_risk">High Value At Risk</option>
        </select>

        {/* Risk Level Filter */}
        <select
          value={riskLevel}
          onChange={(e) => {
            setRiskLevel(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>

        {/* Recovery Status Filter */}
        <select
          value={recoveryStatus}
          onChange={(e) => {
            setRecoveryStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="blocked">Blocked</option>
          <option value="escalated">Escalated</option>
          <option value="recovered">Recovered</option>
          <option value="stopped">Stopped</option>
        </select>

        <span className="ml-auto text-xs text-slate-500">
          Showing {items.length} of {total} risk events
        </span>
      </div>

      {/* Events Table */}
      <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Leakage Type</th>
                <th className="pb-3 font-semibold">Risk Score</th>
                <th className="pb-3 font-semibold">Recovery Prob.</th>
                <th className="pb-3 font-semibold">Expected Net</th>
                <th className="pb-3 font-semibold">Recommended Action</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((tx) => (
                <tr
                  key={tx.transactionId}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 font-mono font-bold text-blue-400">{tx.transactionId}</td>
                  <td className="py-3 text-slate-200 font-medium">{tx.customerName}</td>
                  <td className="py-3 font-bold text-white">{formatINR(tx.amount)}</td>
                  <td className="py-3 capitalize text-slate-300">
                    {tx.leakageType ? tx.leakageType.replace(/_/g, ' ') : '—'}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.riskScore > 70
                          ? 'bg-rose-500/20 text-rose-400'
                          : tx.riskScore > 40
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {tx.riskScore || 30}/100
                    </span>
                  </td>
                  <td className="py-3 font-bold text-blue-400">
                    {formatPercent(tx.recoveryProbability * 100)}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    {formatINR(tx.expectedNetRecovery || tx.amount * 0.65)}
                  </td>
                  <td className="py-3 uppercase font-mono text-[10px] text-slate-300">
                    {tx.recommendedIntervention || 'delayed_retry'}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={tx.recoveryStatus || 'pending'} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 25)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedTx && (
        <AIDecisionDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onExecutionComplete={loadRiskEvents}
        />
      )}
    </div>
  );
};
