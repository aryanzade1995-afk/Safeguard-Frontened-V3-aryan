import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden w-full">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 min-w-0 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Consent, data choice, and the questionnaire itself are browsable
              without an account — only submitting the questionnaire (which
              writes to Supabase) requires sign-in, prompted at that point. */}
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/financial-data" element={<FinancialData />} />
          <Route path="/pattern-analysis" element={<PatternAnalysis />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
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
