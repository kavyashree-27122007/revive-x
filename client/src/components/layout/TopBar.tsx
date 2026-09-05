import React from 'react';
import { ModeIndicator } from './ModeIndicator';
import { PlayCircle, Database } from 'lucide-react';

interface TopBarProps {
  onLoadDemoData?: () => void;
  onOpenDemoGuide?: () => void;
  isLoading?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onLoadDemoData,
  onOpenDemoGuide,
  isLoading,
}) => {
  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-bold text-slate-800 tracking-tight hidden md:block">
          AI Revenue Recovery Intelligence & Orchestration
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode Indicators */}
        <ModeIndicator />

        {/* Load Demo Data Button */}
        {onLoadDemoData && (
          <button
            onClick={onLoadDemoData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/70 transition-all disabled:opacity-50"
            title="Populate 10,000 synthetic transactions"
          >
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            <span>Load Demo Data</span>
          </button>
        )}

        {/* 5-Min Demo Walkthrough Guide Button */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>5-Min Demo Guide</span>
          </button>
        )}
      </div>
    </header>
  );
};
