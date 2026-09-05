import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'recovery' | 'payment' | 'risk' | 'policy';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'recovery' }) => {
  const s = (status || '').toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (s === 'approved' || s === 'recovered' || s === 'success' || s === 'low') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s === 'blocked' || s === 'failed' || s === 'high') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (s === 'escalated' || s === 'medium') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (s === 'stopped') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  } else if (s === 'pending' || s === 'analyzing') {
    colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    dotColor = 'bg-cyan-500';
  } else if (s === 'ai_recommended' || s === 'ai') {
    colorClasses = 'bg-violet-50 text-violet-700 border-violet-200';
    dotColor = 'bg-violet-500';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-xs ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
      {status ? status.replace(/_/g, ' ') : '—'}
    </span>
  );
};
