import React, { useEffect, useState } from 'react';
import { History, Search, Filter, ShieldCheck, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatINR, formatDate } from '../lib/format';
import { api } from '../lib/api';

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState<string>('');
  const [actor, setActor] = useState<string>('');
  const [searchTx, setSearchTx] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, pageSize: 30 };
      if (eventType) params.eventType = eventType;
      if (actor) params.actor = actor;
      if (searchTx) params.transactionId = searchTx;

      const res = await api.getAuditLog(params);
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, eventType, actor]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Explainable Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, chronological record of every revenue risk detected, AI diagnosis, Guardian policy check, and payment execution.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#121826]/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />

          {/* Event Type */}
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Event Types</option>
            <option value="REVENUE_RISK_DETECTED">Revenue Risk Detected</option>
            <option value="TRANSACTION_DIAGNOSED">Transaction Diagnosed</option>
            <option value="RECOVERY_PROBABILITY_CALCULATED">Probability Scored</option>
            <option value="POLICY_CHECK">Policy Check</option>
            <option value="ACTION_APPROVED">Action Approved</option>
            <option value="ACTION_BLOCKED">Action Blocked</option>
            <option value="ACTION_ESCALATED">Action Escalated</option>
            <option value="ACTION_STOPPED">Action Stopped</option>
            <option value="ACTION_EXECUTED">Action Executed</option>
            <option value="RECOVERY_RECORDED">Recovery Recorded</option>
            <option value="DEMO_DATA_LOADED">Demo Data Loaded</option>
            <option value="POLICY_UPDATED">Policy Updated</option>
          </select>

          {/* Actor */}
          <select
            value={actor}
            onChange={(e) => {
              setActor(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Actors</option>
            <option value="AI_ENGINE">AI Engine</option>
            <option value="GUARDIAN">Guardian Policy Engine</option>
            <option value="SYSTEM">System Orchestrator</option>
            <option value="MERCHANT">Merchant Operator</option>
            <option value="RAZORPAY">Razorpay Gateway</option>
          </select>
        </div>

        {/* Search by Tx ID */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Transaction ID..."
            value={searchTx}
            onChange={(e) => setSearchTx(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
          >
            Search
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Transaction</th>
                <th className="pb-3 font-semibold">Event Type</th>
                <th className="pb-3 font-semibold">Actor</th>
                <th className="pb-3 font-semibold">Action & Reason</th>
                <th className="pb-3 font-semibold">Policy Result</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 text-slate-400 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3 font-bold text-blue-400 whitespace-nowrap">
                    {log.transactionId}
                  </td>
                  <td className="py-3 text-slate-200 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="py-3 text-indigo-400 font-bold whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="py-3 font-sans text-slate-300 max-w-md">
                    <div className="font-semibold text-white">{log.action}</div>
                    <div className="text-[11px] text-slate-400 truncate">{log.reason}</div>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {log.policyResult ? (
                      <StatusBadge status={log.policyResult} />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-200 whitespace-nowrap">
                    {log.amount > 0 ? formatINR(log.amount) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>Page {page} of {Math.max(1, Math.ceil(total / 30))}</span>
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
              disabled={page >= Math.ceil(total / 30)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
