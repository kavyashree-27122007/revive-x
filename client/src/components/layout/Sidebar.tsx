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
    <aside className="w-64 border-r border-slate-800 bg-[#0E131F] flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white">REVIVE</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black">X</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Recovery Decision Engine
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Track 03 Tagline badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Track 03 Built</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            "Find revenue slipping away and win it back safely."
          </p>
        </div>
      </div>
    </aside>
  );
};
