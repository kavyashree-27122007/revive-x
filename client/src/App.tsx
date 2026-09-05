import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DemoGuideModal } from './components/demo/DemoGuideModal';
import { CommandCenter } from './pages/CommandCenter';
import { RevenueRadar } from './pages/RevenueRadar';
import { AIDecisions } from './pages/AIDecisions';
import { RecoverySimulator } from './pages/RecoverySimulator';
import { Transactions } from './pages/Transactions';
import { Policies } from './pages/Policies';
import { AuditTrail } from './pages/AuditTrail';
import { Settings } from './pages/Settings';
import { api } from './lib/api';

export const App: React.FC = () => {
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const handleLoadDemoData = async () => {
    setIsLoadingData(true);
    try {
      await api.loadDemoData(10000);
      window.location.reload();
    } catch (err) {
      console.error('Failed to load demo data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRunBatch = async () => {
    try {
      await api.runBatchRecovery(1000);
      window.location.reload();
    } catch (err) {
      console.error('Batch run failed:', err);
    }
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            onLoadDemoData={handleLoadDemoData}
            onOpenDemoGuide={() => setShowDemoGuide(true)}
            isLoading={isLoadingData}
          />

          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            <Routes>
              <Route path="/" element={<CommandCenter />} />
              <Route path="/radar" element={<RevenueRadar />} />
              <Route path="/decisions" element={<AIDecisions />} />
              <Route path="/simulator" element={<RecoverySimulator />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>

        {/* 5-Min Demo Guide Modal */}
        {showDemoGuide && (
          <DemoGuideModal
            onClose={() => setShowDemoGuide(false)}
            onLoadData={handleLoadDemoData}
            onRunBatch={handleRunBatch}
          />
        )}
      </div>
    </BrowserRouter>
  );
};
export default App;
