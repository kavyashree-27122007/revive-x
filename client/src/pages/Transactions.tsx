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
          <h2 className="text-xl font-bold text-white">All Transactions</h2>
          <p className="text-xs text-slate-400">
            Complete transaction ledger ingested from checkout and payment gateways.
          </p>
        </div>
        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#121826]/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
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

        <span className="text-xs text-slate-500">
          Showing {transactions.length} of {total} records
        </span>
      </div>

      {/* Table */}
      <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Product</th>
                <th className="pb-3 font-semibold">Payment Status</th>
                <th className="pb-3 font-semibold">Failure Cause</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr
                  key={tx.transactionId}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 font-mono font-bold text-blue-400">{tx.transactionId}</td>
                  <td className="py-3 text-slate-200">{tx.customerName}</td>
                  <td className="py-3 font-bold text-white">{formatINR(tx.amount)}</td>
                  <td className="py-3 text-slate-300 max-w-xs truncate">{tx.product}</td>
                  <td className="py-3">
                    <StatusBadge status={tx.paymentStatus} />
                  </td>
                  <td className="py-3 font-mono text-[10px] text-rose-400">
                    {tx.failureReason || '—'}
                  </td>
                  <td className="py-3 text-slate-400">{formatDate(tx.timestamp)}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
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
          onExecutionComplete={loadTransactions}
        />
      )}
    </div>
  );
};
