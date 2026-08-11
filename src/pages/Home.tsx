import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronDown,
  FileText,
  BarChart2,
  HelpCircle,
  PieChart,
  BookOpen,
  EyeOff,
  Sliders,
  Sparkles,
  Wallet,
  AlertCircle,
  FileCheck2,
  ShieldAlert,
  HardDrive,
  Info,
  Play,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { AmbientLines } from '../components/common/AmbientLines';
import { HeroWaveField } from '../components/common/HeroWaveField';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { calculatedScore, patterns, transactions, startDemo, isAuthenticated, openAuthModal } = useSafeguard();
  const flaggedCount = transactions.filter((t) => t.flagged).length;

  const handleStartAssessment = () => {
    if (!isAuthenticated) {
      openAuthModal('login', '/assessment');
    } else {
      navigate('/assessment');
    }
  };

  const handleStartDemo = () => {
    startDemo();
    addToast({
      title: 'Demo Mode Activated',
      description: 'Preloaded 6-month fictional profile (₹45,000 income, Maya Sharma).',
      type: 'success',
    });
    navigate('/financial-data');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-0 space-y-20 py-4 sm:py-8 animate-fade-in selection:bg-indigo-100 selection:text-indigo-900">
      {/* Ambient background line decoration — purely visual, sits behind content */}
      <AmbientLines corner="top-left" />
      <AmbientLines corner="bottom-right" />

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-2 pb-8">
        {/* Data -> Patterns -> Insight flowing wave/particle field, behind content */}
        <HeroWaveField />

        {/* Left Column: Typography & CTAs */}
        <div className="relative z-10 lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Private & Consent-Based Financial Reflection</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.1]">
            Understand your financial autonomy.
          </h1>

          <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl leading-relaxed">
            Safeguard helps you identify unusual financial patterns and reflect on your financial independence through a private, consent-based assessment.
          </p>

          <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Your financial data is optional. You stay in control.</span>
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleStartDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Start Demo</span>
            </button>

            <button
              onClick={handleStartAssessment}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Start privately</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF9F6] text-slate-700 font-bold text-base rounded-xl border border-[#EDECE8] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>See how it works</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Column: Sophisticated Abstract Dashboard Preview */}
        <div className="relative z-10 lg:col-span-5 w-full">
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Ambient subtle decorative light pill */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            {/* Panel Header */}
            <div className="border-b border-[#EDECE8] pb-4">
              <p className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-bold">
                How your data becomes insight
              </p>
              <h3 className="text-lg font-bold text-[#1A1A1A] mt-0.5">From raw data to reflection</h3>
            </div>

            {/* 5-Node Flow Visual: Income -> Transactions -> Patterns -> Context -> Insights */}
            <div className="space-y-0">
              {[
                { icon: Wallet, label: 'Income', desc: 'Your earnings, if you choose to share them' },
                { icon: FileText, label: 'Transactions', desc: 'Optional statement or CSV data' },
                { icon: BarChart2, label: 'Patterns', desc: 'Neutral, observational trends' },
                { icon: HelpCircle, label: 'Context', desc: 'Your voluntary reflection answers' },
                { icon: Sparkles, label: 'Insights', desc: 'A private, non-diagnostic summary' },
              ].map((node, idx, arr) => (
                <div key={node.label} className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <node.icon className="w-4 h-4" />
                    </div>
                    {idx < arr.length - 1 && <div className="w-px flex-1 bg-stone-200 my-1"></div>}
                  </div>
                  <div className={idx < arr.length - 1 ? 'pb-5' : ''}>
                    <span className="text-sm font-bold text-slate-900 block">{node.label}</span>
                    <span className="text-xs text-[#6B7280]">{node.desc}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Three steps. Your data. Your choice.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Safeguard puts you entirely in the driver's seat. Proceed at your own pace with total privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
            <div className="space-y-4">
              <span className="text-4xl font-extrabold text-indigo-600 block">01</span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Share what you're comfortable sharing
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Upload a sample statement, CSV, or continue without financial data.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDECE8] text-xs font-semibold text-indigo-600 flex items-center space-x-1">
              <span>Financial data is always optional</span>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
            <div className="space-y-4">
              <span className="text-4xl font-extrabold text-indigo-600 block">02</span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Add your context
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Answer confidential questions about financial autonomy and control.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDECE8] text-xs font-semibold text-indigo-600 flex items-center space-x-1">
              <span>Multiple choice & skip options</span>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
            <div className="space-y-4">
              <span className="text-4xl font-extrabold text-indigo-600 block">03</span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Understand the signals
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Review patterns and receive an educational risk assessment.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDECE8] text-xs font-semibold text-indigo-600 flex items-center space-x-1">
              <span>Actionable guidance & safety steps</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- WHY SAFEGUARD ---------------- */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Built for reflection, designed for autonomy.
          </h2>
          <p className="text-sm text-[#6B7280]">
            Our core principles prioritize human dignity, clarity, and safety over automated judgments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Patterns, not accusations</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Transaction data can reveal patterns, not intent.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Consent at every step</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              You decide what information to provide.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Private by design</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Sensitive information should remain under your control.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Human judgment matters</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Safeguard supports reflection—it does not replace professionals.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- PRIVACY SECTION ---------------- */}
      <section id="privacy" className="scroll-mt-24 bg-white border border-[#EDECE8] rounded-[24px] p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privacy Standard</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Your financial information is yours.
            </h2>

            <p className="text-base text-[#6B7280] leading-relaxed">
              Safeguard is engineered from the ground up to operate completely client-side. We do not store your financial records on remote servers.
            </p>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Optional financial data</h4>
                <p className="text-xs text-[#6B7280]">Complete assessments with or without CSV statement uploads.</p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Transparent processing</h4>
                <p className="text-xs text-[#6B7280]">All pattern algorithms run directly inside your browser memory.</p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">User-controlled deletion</h4>
                <p className="text-xs text-[#6B7280]">Wipe all local session records anytime with a single click.</p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Secure handling</h4>
                <p className="text-xs text-[#6B7280]">Includes quick exit and discreet branding mode for safety.</p>
              </div>
            </div>
          </div>

          {/* Right SVG Shield Illustration */}
          <div className="lg:col-span-5 flex items-center justify-center p-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Subtle background circles */}
              <div className="absolute inset-0 rounded-full bg-indigo-50/80 animate-pulse-subtle"></div>
              <div className="absolute inset-4 rounded-full border border-indigo-200/60 border-dashed"></div>

              {/* Pure SVG Shield Illustration */}
              <svg
                className="w-36 h-36 text-indigo-600 relative z-10 filter drop-shadow-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#EEF2FF" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4F46E5" strokeWidth="1.5" />
                <circle cx="12" cy="11" r="3" fill="#4F46E5" />
                <path d="M12 7v1" stroke="#4F46E5" strokeWidth="2" />
                <path d="M12 14v2" stroke="#4F46E5" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- IMPORTANT DISCLAIMER ---------------- */}
      <section className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-6 sm:p-8 text-center max-w-4xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Educational Disclaimer</span>
        </div>
        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-3xl mx-auto">
          "Safeguard is an educational decision-support tool. It cannot determine whether financial abuse has occurred and cannot identify coercion or intent from transaction data alone."
        </p>
      </section>

      {/* ---------------- INTERACTIVE APP TOOLKIT BRIDGE ---------------- */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EDECE8] pb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">Explore the Interactive Safeguard Toolkit</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any tool below to begin your private reflection session.
            </p>
          </div>
          <NavLink to="/assessment">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
              Launch Full Guided Assessment
            </button>
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavLink to="/assessment" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Guided Assessment</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Evaluate account access, decision autonomy, emergency fund access, and debt control.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/financial-data" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Pattern Scanner & CSV</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Optionally upload CSV files to scan for recurring transfers or credential changes.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Review Data <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
                {flaggedCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full">
                    {flaggedCount} Flagged
                  </span>
                )}
              </div>
            </div>
          </NavLink>

          <NavLink to="/questionnaire" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Confidential Survey</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Answer optional qualitative questions about spending approval and document control.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Start Survey</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/pattern-analysis" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Pattern Analysis Engine</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Deep-dive into identified signals, risk factors, and recommended personal precautions.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Analyze Signals</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/results" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Autonomy Report</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  View your comprehensive Autonomy Index score, category breakdown, and PDF export option.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>View Results</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/resources" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Resources & Hotlines</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access emergency account setup guides, credit protection checklists, and support hotlines.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Access Resources</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>
        </div>
      </section>
    </div>
  );
};

