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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">System Settings & Infrastructure Diagnostics</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Runtime environment configuration, AI engine modes, and database connection status.
        </p>
      </div>

      {/* Service Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database */}
        <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Database Layer</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white capitalize">
            {health?.services?.database === 'connected' ? 'MongoDB Connected' : 'High-Performance In-Memory Store'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {health?.services?.database === 'connected'
              ? 'Local or Atlas MongoDB instance active'
              : 'Zero-config fallback active for rapid hackathon demo'}
          </p>
        </div>

        {/* Razorpay Mode */}
        <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Payment Gateway</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white capitalize">
            {health?.services?.razorpay === 'test_mode' ? 'Razorpay Test Mode' : 'Deterministic Mock Mode'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {health?.services?.razorpay === 'test_mode'
              ? 'Real orders created with key_id configured'
              : 'Safe mock execution with deterministic seeds'}
          </p>
        </div>

        {/* AI Provider */}
        <div className="p-5 rounded-xl bg-[#121826]/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">AI Intelligence Engine</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white capitalize">
            {health?.services?.ai === 'gemini' ? 'Google Gemini 1.5 Pro' : 'Deterministic Decision Engine'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {health?.services?.ai === 'gemini'
              ? 'Live LLM explanation enhancement active'
              : 'Guaranteed 0-crash deterministic fallback engine'}
          </p>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Reset Demo Environment</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clear all currently loaded transactions, recovery actions, and audit trail entries.
          </p>
        </div>

        {resetMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resetMessage}</span>
          </div>
        )}

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 disabled:opacity-50"
        >
          {isResetting ? 'Resetting...' : 'Reset All Transactions & Logs'}
        </button>
      </div>
    </div>
  );
};
