import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: 'blue' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'violet' | 'rose';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'cyan',
}) => {
  const colorStyles: Record<string, { iconBg: string; text: string; border: string }> = {
    cyan: { iconBg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    blue: { iconBg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    emerald: { iconBg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { iconBg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    purple: { iconBg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    violet: { iconBg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    rose: { iconBg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  };

  const scheme = colorStyles[color] || colorStyles.cyan;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-lg border ${scheme.iconBg} ${scheme.text} ${scheme.border} shadow-xs`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
              trendPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 truncate">{subtitle}</p>
      )}
    </div>
  );
};
