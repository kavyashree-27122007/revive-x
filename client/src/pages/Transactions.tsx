import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIDecisionDrawer } from '../components/decisions/AIDecisionDrawer';
import { formatINR, formatDate } from '../lib/format';
import { api } from '../lib/api';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, pageSize: 25, sortOrder: 'desc' };
      if (paymentStatus) params.paymentStatus = paymentStatus;

      const res = await api.getTransactions(params);
      setTransactions(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, paymentStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">All Ingested Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete transaction ledger ingested from checkout funnels, API webhooks, and payment gateways.
          </p>
        </div>
        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs w-fit transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="">All Payment Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="abandoned">Abandoned</option>
            <option value="subscription_failed">Subscription Failed</option>
            <option value="overdue">Overdue</option>
            <option value="repeated_failure">Repeated Failure</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{transactions.length}</strong> of <strong className="text-slate-900">{total}</strong> records
        </span>
      </div>

      {/* Ledger Table */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Payment Status</th>
                <th className="py-2.5 px-3">Failure Cause</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr
                  key={tx.transactionId}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono font-bold text-cyan-700">{tx.transactionId}</td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">{tx.customerName}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{formatINR(tx.amount)}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{tx.product}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={tx.paymentStatus} />
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-rose-600">
                    {tx.failureReason ? (
                      <span className="bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {tx.failureReason}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(tx.timestamp)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-3 py-1 rounded text-[11px] font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 transition-colors"
                    >
                      Details
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
          onExecutionComplete={loadTransactions}
        />
      )}
    </div>
  );
};
