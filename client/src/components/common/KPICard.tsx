import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'blue',
}) => {
  const colorStyles = {
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
  }[color];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#121826]/80 p-5 backdrop-blur-md shadow-sm transition-all hover:border-slate-700 bg-gradient-to-b ${colorStyles}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-900/80 border border-slate-800 ${colorStyles.split(' ')[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  );
};
