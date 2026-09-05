import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'recovery' | 'payment' | 'risk' | 'policy';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'recovery' }) => {
  const s = (status || '').toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (s === 'approved' || s === 'recovered' || s === 'success') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (s === 'blocked' || s === 'failed') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (s === 'escalated') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (s === 'stopped') {
    colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  } else if (s === 'pending' || s === 'analyzing') {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (s === 'high') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (s === 'medium') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (s === 'low') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status ? status.replace(/_/g, ' ') : '—'}
    </span>
  );
};
