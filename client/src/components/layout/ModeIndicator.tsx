import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

export const ModeIndicator: React.FC = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth({ services: { razorpay: 'mock_mode', ai: 'deterministic', database: 'in_memory' } }));
  }, []);

  const razorpayMode = health?.services?.razorpay || 'mock_mode';
  const isMock = razorpayMode === 'mock_mode';
  const aiProvider = health?.services?.ai || 'deterministic';

  return (
    <div className="flex items-center gap-2">
      {/* Razorpay Mode Badge */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
          isMock
            ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm'
        }`}
        title={isMock ? 'Running without live Razorpay keys - deterministic simulated execution' : 'Razorpay Test Mode active'}
      >
        {isMock ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
        <span>{isMock ? 'MOCK PAYMENT MODE' : 'RAZORPAY TEST MODE'}</span>
      </div>

      {/* AI Provider Badge - subtle violet for AI */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 shadow-sm">
        <Cpu className="w-3.5 h-3.5 text-violet-600" />
        <span className="uppercase">{aiProvider === 'gemini' ? 'GEMINI 1.5 PRO AI' : 'DETERMINISTIC AI'}</span>
      </div>
    </div>
  );
};
