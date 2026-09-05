import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { formatINR, formatPercent } from '../../lib/format';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../lib/api';

interface AIDecisionDrawerProps {
  transaction: any;
  onClose: () => void;
  onExecutionComplete?: () => void;
}

export const AIDecisionDrawer: React.FC<AIDecisionDrawerProps> = ({
  transaction: tx,
  onClose,
  onExecutionComplete,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!tx) return null;

  const isDemoBlocked = tx.transactionId === 'TXN-DEMO-9999';
  const isDemoEscalated = tx.transactionId === 'TXN-DEMO-9998';
  const isDemoStop = tx.transactionId === 'TXN-DEMO-9997';

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      const res = await api.executeRecovery(tx.transactionId);
      setExecutionResult(res);
      if (onExecutionComplete) onExecutionComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0E131F] border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0E131F] z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 font-mono">
                {tx.transactionId}
              </span>
              <StatusBadge status={tx.recoveryStatus || 'pending'} />
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              AI Decision & Explainability Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* 1. What Happened? */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              1. What Happened?
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <span className="text-slate-500 text-xs block">Customer</span>
                <span className="font-semibold text-slate-200">{tx.customerName || 'Customer'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Transaction Amount</span>
                <span className="font-bold text-white text-base">{formatINR(tx.amount)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Failure Reason</span>
                <span className="text-rose-400 font-mono text-xs">{tx.failureReason || 'checkout_abandoned'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Previous Retries</span>
                <span className="text-slate-200">{tx.retryCount || 0} attempts</span>
              </div>
            </div>
          </div>

          {/* 2. Why Is It At Risk? */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2. Why Is It At Risk?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Classified as <span className="text-amber-400 font-semibold">{tx.leakageType ? tx.leakageType.replace(/_/g, ' ') : 'Payment Leakage'}</span>.
              The customer attempted payment with error pattern <code className="text-xs text-rose-300 bg-rose-500/10 px-1 py-0.5 rounded">{tx.failureReason || 'timeout'}</code>.
              Risk Score: <span className="font-bold text-white">{tx.riskScore || 45}/100</span>.
            </p>
          </div>

          {/* 3. Calculations: Probability & Net Recovery */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery Prob.</span>
              <span className="text-xl font-extrabold text-blue-400 mt-1 block">
                {formatPercent((tx.recoveryProbability || 0.65) * 100)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Intervention Cost</span>
              <span className="text-xl font-extrabold text-slate-300 mt-1 block">
                {formatINR(tx.interventionCost || 0)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Exp. Net Recovery</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                {formatINR(tx.expectedNetRecovery || tx.amount * 0.65)}
              </span>
            </div>
          </div>

          {/* 4. Guardian Policy Verification Banner */}
          <div
            className={`p-4 rounded-xl border ${
              isDemoBlocked
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : isDemoEscalated
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : isDemoStop
                ? 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isDemoBlocked ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : isDemoEscalated ? (
                <AlertOctagon className="w-5 h-5 text-amber-400" />
              ) : isDemoStop ? (
                <Lock className="w-5 h-5 text-slate-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Guardian Policy Engine Check:{' '}
                {isDemoBlocked ? 'BLOCKED' : isDemoEscalated ? 'ESCALATED' : isDemoStop ? 'STOPPED' : 'APPROVED'}
              </h4>
            </div>

            {isDemoBlocked ? (
              <div className="text-xs space-y-1.5 text-slate-200">
                <p>
                  <strong className="text-rose-400">Policy Violation:</strong> AI initially proposed a <strong>25% Merchant Incentive</strong>, which violates the merchant guardrail limit of <strong>maximum 10% discount</strong>.
                </p>
                <div className="p-2 rounded bg-black/40 text-[11px] font-mono border border-rose-500/20">
                  Requested: 25% | Allowed: 10% | Status: BLOCKED
                </div>
                <p className="text-emerald-400 font-medium pt-1">
                  ✓ Autonomous Fallback: Guardian re-evaluated candidate strategies and approved <strong>Delayed Retry</strong> (100% policy-compliant alternative).
                </p>
              </div>
            ) : isDemoEscalated ? (
              <div className="text-xs space-y-1.5 text-slate-200">
                <p>
                  Amount <strong className="text-amber-400">{formatINR(tx.amount)}</strong> exceeds autonomous limit of <strong>₹10,000</strong>.
                </p>
                <p className="text-amber-400">
                  Status: Flagged for Merchant Manual Approval before funds execution.
                </p>
              </div>
            ) : isDemoStop ? (
              <div className="text-xs space-y-1.5 text-slate-200">
                <p>
                  Transaction is outside the 48-hour recovery window and retry count ({tx.retryCount}) exceeds limits with low recovery probability ({formatPercent(tx.recoveryProbability * 100)}).
                </p>
                <p className="text-slate-400">
                  Recovery stopped to prevent customer annoyance and uneconomical recovery attempts.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Intervention satisfies all merchant policies: within retry limit (2), within recovery window (48h), and net recovery is positive.
              </p>
            )}
          </div>

          {/* 5. Explainable AI Reasoning */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              5. Why Was This Strategy Selected?
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed italic bg-purple-500/5 p-3 rounded-lg border border-purple-500/20">
              "{tx.recommendedIntervention === 'delayed_retry'
                ? 'Delayed retry was selected because the transaction shows a temporary failure pattern, the customer has previous successful payments, and the strategy yields the highest expected net recovery among policy-compliant options.'
                : tx.recommendedIntervention === 'payment_link'
                ? 'A fresh payment link was selected to remove friction from the abandoned checkout stage without incurring incentive discount expenses.'
                : tx.recommendedIntervention === 'stop'
                ? 'Recovery was stopped because probability is below merchant threshold and retries are exhausted.'
                : 'Selected as the optimal strategy maximizing expected net recovery within merchant-defined policy guardrails.'}"
            </p>
          </div>

          {/* Execution Result Alert */}
          {executionResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Execution Succeeded!</span>
              </div>
              <p>
                {executionResult.success
                  ? `Revenue of ${formatINR(tx.amount)} successfully recovered!`
                  : 'Recovery action executed.'}
              </p>
              <p className="font-mono text-[10px] opacity-75">
                Razorpay Order ID: {executionResult.action?.razorpayOrderId || 'order_test_mock_123'}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-[#0E131F] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Selected Action:{' '}
            <strong className="text-white uppercase font-mono">
              {tx.recommendedIntervention || (isDemoBlocked ? 'delayed_retry' : 'payment_reminder')}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Close
            </button>

            {tx.recoveryStatus !== 'recovered' && !executionResult?.success && (
              <button
                onClick={handleExecute}
                disabled={isExecuting || isDemoStop}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isExecuting ? 'Executing...' : 'Execute Recovery'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
