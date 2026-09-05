import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  BrainCircuit,
  SlidersHorizontal,
  ArrowLeftRight,
  ShieldCheck,
  History,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/radar', label: 'Revenue Radar', icon: Radar },
  { path: '/decisions', label: 'AI Decisions', icon: BrainCircuit },
  { path: '/simulator', label: 'Recovery Simulator', icon: SlidersHorizontal },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/policies', label: 'Policy Guardrails', icon: ShieldCheck },
  { path: '/audit', label: 'Audit Trail', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#090D16] flex flex-col justify-between shrink-0 min-h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white">REVIVE</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-black border border-cyan-500/30">X</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Recovery Intelligence
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* System Status & Track 03 Tagline */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Live Operational Health */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">System Operational</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">100%</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] tracking-wide uppercase">Track 03 Built</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            "Find revenue slipping away and win it back safely."
          </p>
        </div>
      </div>
    </aside>
  );
};
