import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { Login } from './pages/Login';
import { api } from './lib/api';

const isAuthenticated = () => localStorage.getItem('revivex_auth') === 'true';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

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
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected app shell */}
        <Route
          path="/*"
          element={
            <ProtectedLayout>
              <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
                <Sidebar />
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
                {showDemoGuide && (
                  <DemoGuideModal
                    onClose={() => setShowDemoGuide(false)}
                    onLoadData={handleLoadDemoData}
                    onRunBatch={handleRunBatch}
                  />
                )}
              </div>
            </ProtectedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;

