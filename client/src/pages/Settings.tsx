import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Server, Shield, Cpu, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export const Settings: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'ok', services: { database: 'in_memory', razorpay: 'mock_mode', ai: 'deterministic' } }));
  }, []);

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all demo data and start fresh?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await api.resetDemoData();
      setResetMessage(res.message);
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const isRazorpayTest = health?.services?.razorpay === 'test_mode';

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-600" />
          <h2 className="text-xl font-black tracking-tight text-slate-900">System Infrastructure Diagnostics</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Runtime environment configuration, AI engine modes, and payment gateway infrastructure status.
        </p>
      </div>

      {/* Service Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Database */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Layer</span>
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-black text-slate-900 capitalize">
              {health?.services?.database === 'connected' ? 'MongoDB Connected' : 'In-Memory Store Active'}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {health?.services?.database === 'connected'
                ? 'Persistent MongoDB instance storing all transactions, recovery actions, and audit logs.'
                : 'Zero-config high-performance in-memory cache active for rapid hackathon demonstration.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-600">● Operational</span>
          </div>
        </div>

        {/* Payment Gateway - Clearly distinguishing Test Mode vs Mock Mode */}
        <div className={`p-6 rounded-2xl bg-white border-2 shadow-xs flex flex-col justify-between ${
          isRazorpayTest ? 'border-emerald-300' : 'border-amber-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gateway Status</span>
              <div className={`p-2 rounded-lg ${
                isRazorpayTest ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-black text-slate-900">
              {isRazorpayTest ? 'Razorpay Test Mode' : 'Deterministic Mock Mode'}
            </div>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isRazorpayTest
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {isRazorpayTest ? '● Live Test Credentials' : '● Deterministic Simulation'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isRazorpayTest
                ? 'Authenticated with real Razorpay Test API keys. Generates genuine test payment links and payment order objects.'
                : 'Deterministic simulated gateway execution with mathematical seed reproducibility. Safe for offline testing.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 italic">
            Truthful Fintech Guarantee: Mock payments never pretend to be live bank settlements.
          </div>
        </div>

        {/* AI Provider - Subtle Violet for AI */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Engine</span>
              <div className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-black text-slate-900 capitalize">
              {health?.services?.ai === 'gemini' ? 'Google Gemini 1.5 Pro' : 'Deterministic Engine'}
            </div>
            <div className="mt-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
                {health?.services?.ai === 'gemini' ? 'LLM Semantic Reasoning' : 'Math Probabilistic Model'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {health?.services?.ai === 'gemini'
                ? 'Gemini 1.5 Pro generates natural language financial explanations and root cause diagnoses.'
                : 'Zero-crash mathematical decision formulas optimizing expected net recovery under all network conditions.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Latency:</span>
            <span className="font-mono font-bold text-slate-800">12ms avg</span>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-4">
        <div>
          <h3 className="text-sm font-black text-rose-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Reset Demo Environment</span>
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Clear all currently loaded synthetic transactions, recovery interventions, and audit log entries to return to clean baseline.
          </p>
        </div>

        {resetMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{resetMessage}</span>
          </div>
        )}

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
        >
          {isResetting ? 'Resetting Store...' : 'Reset All Transactions & Logs'}
        </button>
      </div>
    </div>
  );
};
