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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Merchant Guardian Policy Guardrails</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Define strict boundaries for autonomous recovery operations. Every AI recommendation must pass these constraints before execution.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Guardrails Card */}
        <div className="p-6 rounded-xl bg-[#121826]/80 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Execution Limits & Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Maximum Retries */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Hard ceiling for automated retries per transaction.
              </span>
            </div>

            {/* Maximum Discount Percentage */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                AI cannot propose discounts exceeding this value (Demo test: 10%).
              </span>
            </div>

            {/* Maximum Contacts */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Caps SMS, emails, and payment links to prevent annoyance.
              </span>
            </div>

            {/* Recovery Window */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Older transactions are stopped automatically (Default: 48h).
              </span>
            </div>

            {/* High Value Threshold */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Transactions above this amount require merchant human sign-off.
              </span>
            </div>

            {/* Minimum Recovery Probability */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Below this likelihood, recovery is stopped as uneconomical.
              </span>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Allow Merchant Discount Incentives
                </span>
                <span className="text-[10px] text-slate-500">
                  Allow AI to propose price concessions to recover checkout abandonment.
                </span>
              </div>
              <input
                type="checkbox"
                checked={policy.allowIncentives ?? true}
                onChange={(e) =>
                  setPolicy({ ...policy, allowIncentives: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Require Human Approval for High-Value Transactions
                </span>
                <span className="text-[10px] text-slate-500">
                  Hold transactions above the escalation threshold until merchant approves.
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
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Success or Error banners */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Policy updated successfully! All recovery decisions and simulator calculations updated immediately.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Guardrails...' : 'Save Policy Guardrails'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
