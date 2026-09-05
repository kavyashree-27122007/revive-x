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
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <h2 className="text-xl font-black tracking-tight text-slate-900">Revenue Radar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuously tracking and scoring revenue-at-risk events across payments, checkouts, and recurring subscriptions.
          </p>
        </div>
        <button
          onClick={loadRiskEvents}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs w-fit transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-cyan-600" />
          <span>Filters:</span>
        </div>

        {/* Leakage Type Filter */}
        <select
          value={leakageType}
          onChange={(e) => {
            setLeakageType(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
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
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
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
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="blocked">Blocked</option>
          <option value="escalated">Escalated</option>
          <option value="recovered">Recovered</option>
          <option value="stopped">Stopped</option>
        </select>

        <span className="ml-auto text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{items.length}</strong> of <strong className="text-slate-900">{total}</strong> risk events
        </span>
      </div>

      {/* Events Table */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Leakage Type</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3">Recovery Prob.</th>
                <th className="py-2.5 px-3">Expected Net</th>
                <th className="py-2.5 px-3">Recommended Action</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((tx) => (
                <tr
                  key={tx.transactionId}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono font-bold text-cyan-700">{tx.transactionId}</td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">{tx.customerName}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{formatINR(tx.amount)}</td>
                  <td className="py-3 px-3 capitalize text-slate-600">
                    {tx.leakageType ? tx.leakageType.replace(/_/g, ' ') : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        tx.riskScore > 70
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : tx.riskScore > 40
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {tx.riskScore > 70 ? 'HIGH RISK' : tx.riskScore > 40 ? 'MEDIUM' : 'LOW RISK'} ({tx.riskScore || 30})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-600">
                    {formatPercent(tx.recoveryProbability * 100)}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-600">
                    {formatINR(tx.expectedNetRecovery || tx.amount * 0.65)}
                  </td>
                  <td className="py-3 px-3 uppercase font-mono text-[10px] text-slate-600">
                    {tx.recommendedIntervention || 'delayed_retry'}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={tx.recoveryStatus || 'pending'} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-3 py-1 rounded text-[11px] font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 transition-colors"
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <span>Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{Math.max(1, Math.ceil(total / 25))}</strong></span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 font-semibold transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 25)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 font-semibold transition-colors"
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
