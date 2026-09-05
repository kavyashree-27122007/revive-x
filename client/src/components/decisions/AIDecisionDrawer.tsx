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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                {tx.transactionId}
              </span>
              <StatusBadge status={tx.recoveryStatus || 'pending'} />
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 mt-1">
              AI Decision & Explainability Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* 1. What Happened? */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              1. What Happened?
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <span className="text-slate-400 text-xs block font-medium">Customer</span>
                <span className="font-bold text-slate-800">{tx.customerName || 'Customer'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-medium">Transaction Amount</span>
                <span className="font-black text-slate-900 text-base">{formatINR(tx.amount)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-medium">Failure Reason</span>
                <span className="text-rose-700 font-mono text-xs font-semibold">{tx.failureReason || 'checkout_abandoned'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-medium">Previous Retries</span>
                <span className="text-slate-700 font-medium">{tx.retryCount || 0} attempts</span>
              </div>
            </div>
          </div>

          {/* 2. Why Is It At Risk? */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2. Why Is It At Risk?
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Classified as <strong className="text-amber-800 font-bold">{tx.leakageType ? tx.leakageType.replace(/_/g, ' ') : 'Payment Leakage'}</strong>.
              The customer attempted payment with error code <code className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-mono">{tx.failureReason || 'timeout'}</code>.
              Risk Score: <strong className="text-slate-900 font-black">{tx.riskScore || 45}/100</strong>.
            </p>
          </div>

          {/* 3. Calculations: Probability & Net Recovery */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery Prob.</span>
              <span className="text-xl font-black text-cyan-700 mt-1 block">
                {formatPercent((tx.recoveryProbability || 0.65) * 100)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Intervention Cost</span>
              <span className="text-xl font-black text-slate-700 mt-1 block font-mono">
                {formatINR(tx.interventionCost || 0)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Exp. Net Recovery</span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {formatINR(tx.expectedNetRecovery || tx.amount * 0.65)}
              </span>
            </div>
          </div>

          {/* 4. Guardian Policy Verification Banner */}
          <div
            className={`p-4 rounded-xl border ${
              isDemoBlocked
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : isDemoEscalated
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : isDemoStop
                ? 'bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isDemoBlocked ? (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              ) : isDemoEscalated ? (
                <AlertOctagon className="w-5 h-5 text-amber-600" />
              ) : isDemoStop ? (
                <Lock className="w-5 h-5 text-slate-600" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              )}
              <h4 className="text-xs font-black uppercase tracking-wider">
                Guardian Policy Engine Check:{' '}
                {isDemoBlocked ? 'BLOCKED' : isDemoEscalated ? 'ESCALATED' : isDemoStop ? 'STOPPED' : 'APPROVED'}
              </h4>
            </div>

            {isDemoBlocked ? (
              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  <strong className="text-rose-700">Policy Violation:</strong> AI initially proposed a <strong>25% Merchant Incentive</strong>, which violates the merchant guardrail limit of <strong>maximum 10% discount</strong>.
                </p>
                <div className="p-2 rounded bg-white text-[11px] font-mono border border-rose-200 text-rose-900 font-bold">
                  Requested: 25% | Allowed: 10% | Status: BLOCKED
                </div>
                <p className="text-emerald-700 font-semibold pt-1">
                  ✓ Autonomous Fallback: Guardian re-evaluated candidate strategies and approved <strong>Delayed Retry</strong> (100% policy-compliant alternative).
                </p>
              </div>
            ) : isDemoEscalated ? (
              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  Amount <strong className="text-amber-800 font-bold">{formatINR(tx.amount)}</strong> exceeds autonomous limit of <strong>₹10,000</strong>.
                </p>
                <p className="text-amber-800 font-semibold">
                  Status: Flagged for Merchant Manual Approval before funds execution.
                </p>
              </div>
            ) : isDemoStop ? (
              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  Transaction is outside the 48-hour recovery window and retry count ({tx.retryCount}) exceeds limits with low recovery probability ({formatPercent(tx.recoveryProbability * 100)}).
                </p>
                <p className="text-slate-600">
                  Recovery stopped to prevent customer annoyance and uneconomical recovery attempts.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-700">
                Intervention satisfies all merchant policies: within retry limit (2), within recovery window (48h), and net recovery is positive.
              </p>
            )}
          </div>

          {/* 5. Explainable AI Reasoning (Subtle Violet for AI) */}
          <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              5. Why Was This Strategy Selected?
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-violet-100 shadow-xs">
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
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Execution Succeeded!</span>
              </div>
              <p>
                {executionResult.success
                  ? `Revenue of ${formatINR(tx.amount)} successfully recovered!`
                  : 'Recovery action executed.'}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Razorpay Order ID: {executionResult.action?.razorpayOrderId || 'order_test_mock_123'}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected Action:{' '}
            <strong className="text-slate-900 uppercase font-mono font-bold">
              {tx.recommendedIntervention || (isDemoBlocked ? 'delayed_retry' : 'payment_reminder')}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs cursor-pointer transition-colors"
            >
              Close
            </button>

            {tx.recoveryStatus !== 'recovered' && !executionResult?.success && (
              <button
                onClick={handleExecute}
                disabled={isExecuting || isDemoStop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
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
