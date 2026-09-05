import React, { useEffect, useState } from 'react';
import { ShieldCheck, Save, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const Policies: React.FC = () => {
  const [policy, setPolicy] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPolicy = async () => {
    try {
      const p = await api.getPolicies();
      setPolicy(p);
    } catch (err) {
      console.error('Failed to load policies:', err);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const updated = await api.updatePolicies(policy);
      setPolicy(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update policy');
    } finally {
      setIsSaving(false);
    }
  };

  if (!policy) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading merchant policies...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-600" />
          <h2 className="text-xl font-black tracking-tight text-slate-900">Merchant Guardian Policy Guardrails</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Deterministic boundaries for autonomous recovery operations. Every AI recommendation must pass these constraints before execution.
        </p>
      </div>

      {/* Visual Policy Enforcement Architecture Diagram */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Autonomous Safety Pipeline</span>
            <h3 className="text-sm font-bold text-slate-900">Guardian Policy Enforcement Flow</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            ZERO MARGIN LEAKAGE
          </span>
        </div>

        {/* 4-Step Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-slate-400">STAGE 01</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <strong className="text-slate-900 block font-bold">Telemetry Ingest</strong>
            <p className="text-[11px] text-slate-500 mt-1">
              Gateway webhook or checkout drop-off event detected in real time.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-violet-600">STAGE 02</span>
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            </div>
            <strong className="text-violet-950 block font-bold">AI Recommendation</strong>
            <p className="text-[11px] text-violet-700 mt-1">
              Probability scoring, intervention selection, and discount proposal.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-cyan-700">STAGE 03</span>
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
            </div>
            <strong className="text-cyan-950 block font-bold">Guardian Verification</strong>
            <p className="text-[11px] text-cyan-800 mt-1">
              Hard check against merchant discount caps, retry ceilings, and limits.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400">STAGE 04</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <strong className="text-white block font-bold">Outcome Resolution</strong>
            <div className="grid grid-cols-2 gap-1 mt-1.5 text-[10px] font-bold">
              <span className="text-emerald-400">● APPROVED</span>
              <span className="text-rose-400">● BLOCKED</span>
              <span className="text-amber-400">● ESCALATED</span>
              <span className="text-slate-400">● STOPPED</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Guardrails Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900">
              Execution Limits & Safety Thresholds
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict rules enforced autonomously before any payment link or retry is triggered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Maximum Retries */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Maximum Payment Retry Attempts
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={policy.maximumRetryAttempts ?? 2}
                onChange={(e) =>
                  setPolicy({ ...policy, maximumRetryAttempts: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Hard ceiling for automated retries per transaction to prevent bank throttling.
              </span>
            </div>

            {/* Maximum Discount Percentage */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Maximum Incentive Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={policy.maximumDiscountPercentage ?? 10}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    maximumDiscountPercentage: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                AI cannot propose discounts exceeding this value (Demo test: 10%).
              </span>
            </div>

            {/* Maximum Contacts */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Maximum Customer Contact Attempts
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={policy.maximumContactAttempts ?? 2}
                onChange={(e) =>
                  setPolicy({ ...policy, maximumContactAttempts: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Caps SMS, emails, and payment links to prevent customer annoyance.
              </span>
            </div>

            {/* Recovery Window */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Maximum Recovery Window (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={policy.maximumRecoveryWindowHours ?? 48}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    maximumRecoveryWindowHours: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Older transactions are stopped automatically (Default: 48h).
              </span>
            </div>

            {/* High Value Threshold */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                High-Value Escalation Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={policy.highValueEscalationThreshold ?? 10000}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    highValueEscalationThreshold: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Transactions above this amount require merchant human sign-off.
              </span>
            </div>

            {/* Minimum Recovery Probability */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Minimum Recovery Probability (0 to 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={policy.minimumRecoveryProbability ?? 0.25}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    minimumRecoveryProbability: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Below this likelihood, recovery is terminated as uneconomical.
              </span>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Allow Merchant Discount Incentives
                </span>
                <span className="text-[11px] text-slate-500">
                  Allow AI to propose price concessions up to the maximum discount cap.
                </span>
              </div>
              <input
                type="checkbox"
                checked={policy.allowIncentives ?? true}
                onChange={(e) =>
                  setPolicy({ ...policy, allowIncentives: e.target.checked })
                }
                className="w-4 h-4 rounded text-cyan-600 bg-white border-slate-300 focus:ring-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Require Human Approval for High-Value Transactions
                </span>
                <span className="text-[11px] text-slate-500">
                  Hold transactions above the escalation threshold until merchant explicitly approves.
                </span>
              </div>
              <input
                type="checkbox"
                checked={policy.requireApprovalForHighValue ?? true}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    requireApprovalForHighValue: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-cyan-600 bg-white border-slate-300 focus:ring-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Success or Error banners */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Policy updated successfully! All recovery decisions and simulator calculations updated immediately.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Guardrails...' : 'Save Policy Guardrails'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
