import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SafeguardProvider } from './context/SafeguardContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { RequireAuth } from './components/common/RequireAuth';

// Pages
import { Home } from './pages/Home';
import { Assessment } from './pages/Assessment';
import { FinancialData } from './pages/FinancialData';
import { PatternAnalysis } from './pages/PatternAnalysis';
import { Questionnaire } from './pages/Questionnaire';
import { Results } from './pages/Results';
import { Resources } from './pages/Resources';
import { Settings } from './pages/Settings';
import { PrivacyCenter } from './pages/PrivacyCenter';
import { Dashboard } from './pages/Dashboard';
import { ResetPassword } from './pages/ResetPassword';

const LayoutContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden w-full">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden w-full">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 min-w-0 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/assessment"
            element={
              <RequireAuth>
                <Assessment />
              </RequireAuth>
            }
          />
          <Route
            path="/financial-data"
            element={
              <RequireAuth>
                <FinancialData />
              </RequireAuth>
            }
          />
          <Route
            path="/pattern-analysis"
            element={
              <RequireAuth>
                <PatternAnalysis />
              </RequireAuth>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <RequireAuth>
                <Questionnaire />
              </RequireAuth>
            }
          />
          <Route
            path="/results"
            element={
              <RequireAuth>
                <Results />
              </RequireAuth>
            }
          />
          <Route path="/resources" element={<Resources />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/privacy" element={<PrivacyCenter />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <SafeguardProvider>
      <ToastProvider>
        <Router>
          <LayoutContent />
          <AuthModal />
        </Router>
      </ToastProvider>
    </SafeguardProvider>
  );
}
