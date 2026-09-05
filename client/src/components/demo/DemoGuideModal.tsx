import React from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoGuideModalProps {
  onClose: () => void;
  onLoadData: () => void;
  onRunBatch: () => void;
}

const STEPS = [
  {
    step: 1,
    title: 'Load Demo Dataset',
    desc: 'Click "Load Demo Data" in the top bar to ingest 10,000 synthetic transactions with seeded real distributions.',
    actionText: 'Load Dataset Now',
    actionType: 'loadData',
  },
  {
    step: 2,
    title: 'Analyze Revenue Risk',
    desc: 'Click "Run Recovery Analysis" on Command Center to diagnose risk and calculate recovery probabilities.',
    actionText: 'Run Analysis',
    actionType: 'runBatch',
  },
  {
    step: 3,
    title: 'Inspect Revenue Radar',
    desc: 'Filter transactions by risk level, failure cause, or recovery probability.',
    link: '/radar',
  },
  {
    step: 4,
    title: 'Explainable AI Decision',
    desc: 'Navigate to AI Decisions page and open transaction TXN-DEMO-9999 or TXN-DEMO-9996 to see the full reasoning.',
    link: '/decisions',
  },
  {
    step: 5,
    title: 'Demonstrate Guardian Block',
    desc: 'Observe TXN-DEMO-9999 where AI proposed a 25% discount, Guardian blocked it (max 10%), and switched to Delayed Retry.',
    link: '/decisions',
  },
  {
    step: 6,
    title: 'What-If Recovery Simulator',
    desc: 'Compare Strategy A (Immediate), B (Delayed), C (Reminder), D (Incentive), and E (Smart Segmented) calculated live.',
    link: '/simulator',
  },
  {
    step: 7,
    title: 'Execute Recovery',
    desc: 'Click "Execute Recovery" on an approved transaction to trigger simulated or Razorpay Test Mode execution.',
    link: '/decisions',
  },
  {
    step: 8,
    title: 'Modify Policy Guardrails',
    desc: 'Go to Policy Guardrails and change Max Discount from 10% to 30%, then see the blocked transaction become approved!',
    link: '/policies',
  },
  {
    step: 9,
    title: 'Review Recovered Revenue',
    desc: 'Watch Net Recovered Revenue, Recovery Rate, and ROI dynamically calculate on Command Center.',
    link: '/',
  },
  {
    step: 10,
    title: 'Verify Audit Trail',
    desc: 'Examine the tamper-evident chronological event log tracking every AI diagnosis, Guardian check, and payment capture.',
    link: '/audit',
  },
];

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  onClose,
  onLoadData,
  onRunBatch,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0E131F] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#121826]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                5-Minute Hackathon Demo Script
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step walkthrough to present REVIVE X Track 03 capabilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30 mt-0.5">
                  {s.step}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>

              {s.actionType === 'loadData' && (
                <button
                  onClick={() => {
                    onLoadData();
                    onClose();
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                >
                  {s.actionText}
                </button>
              )}

              {s.actionType === 'runBatch' && (
                <button
                  onClick={() => {
                    onRunBatch();
                    onClose();
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                >
                  {s.actionText}
                </button>
              )}

              {s.link && (
                <button
                  onClick={() => {
                    navigate(s.link);
                    onClose();
                  }}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <span>Go</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#121826] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
