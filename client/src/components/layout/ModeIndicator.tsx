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
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
          isMock
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}
        title={isMock ? 'Running without live Razorpay keys - deterministic simulated execution' : 'Razorpay Test Mode active'}
      >
        {isMock ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
        <span>{isMock ? 'MOCK PAYMENT MODE' : 'RAZORPAY TEST MODE'}</span>
      </div>

      {/* AI Provider Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
        <Cpu className="w-3.5 h-3.5" />
        <span className="uppercase">{aiProvider === 'gemini' ? 'GEMINI 1.5 PRO' : 'DETERMINISTIC AI'}</span>
      </div>
    </div>
  );
};
