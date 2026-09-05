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
    <header className="h-16 border-b border-slate-800 bg-[#0E131F]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-slate-300 hidden md:block">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
            title="Populate 10,000 synthetic transactions"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Load Demo Data</span>
          </button>
        )}

        {/* 5-Min Demo Walkthrough Guide Button */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>5-Min Demo Guide</span>
          </button>
        )}
      </div>
    </header>
  );
};
