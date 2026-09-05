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
            <History className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-black tracking-tight text-slate-900">Explainable Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, chronological record of every revenue risk detected, AI diagnosis, Guardian policy check, and payment execution.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs w-fit transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />

          {/* Event Type */}
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
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
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
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
            className="bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Audit Log Table in crisp white fintech design */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action & Reason</th>
                <th className="py-2.5 px-3">Policy Result</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => {
                const actorBadges: Record<string, string> = {
                  AI_ENGINE: 'bg-violet-50 text-violet-700 border-violet-200',
                  GUARDIAN: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                  MERCHANT: 'bg-slate-100 text-slate-700 border-slate-200',
                  RAZORPAY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  SYSTEM: 'bg-slate-900 text-white border-slate-800',
                };
                const actorStyle = actorBadges[log.actor] || 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={log.auditId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-700 whitespace-nowrap">
                      {log.transactionId}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold border border-slate-200">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${actorStyle}`}>
                        {log.actor}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans max-w-md">
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-[11px] text-slate-500 truncate">{log.reason}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.policyResult ? (
                        <StatusBadge status={log.policyResult} />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {log.amount > 0 ? formatINR(log.amount) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <span>Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{Math.max(1, Math.ceil(total / 30))}</strong></span>
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
              disabled={page >= Math.ceil(total / 30)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
