import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useSafeguard } from '../context/SafeguardContext';
import { AmbientLines } from '../components/common/AmbientLines';
import { ChatbotWidget } from '../components/common/ChatbotWidget';
import { useInView } from '../hooks/useInView';
import { useTranslation } from '../hooks/useTranslation';

const FLOW_NODES = [
  { icon: Wallet, key: 'income' },
  { icon: FileText, key: 'transactions' },
  { icon: BarChart2, key: 'patterns' },
  { icon: HelpCircle, key: 'context' },
  { icon: Sparkles, key: 'insights' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { calculatedScore, patterns, transactions, isAuthenticated, openAuthModal } = useSafeguard();
  const { t } = useTranslation();
  const flaggedCount = transactions.filter((t) => t.flagged).length;

  // One-time sequential reveal of the Income -> ... -> Insights flow nodes
  // on initial load, illuminating each connecting line as the next step activates.
  const [activeStep, setActiveStep] = useState(-1);
  useEffect(() => {
    const timers = FLOW_NODES.map((_, i) =>
      window.setTimeout(() => setActiveStep(i), 400 + i * 380)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const howItWorksReveal = useInView<HTMLElement>();
  const whySafeguardReveal = useInView<HTMLElement>();
  const privacyReveal = useInView<HTMLElement>();
  const disclaimerReveal = useInView<HTMLElement>();
  const toolkitReveal = useInView<HTMLElement>();

  const handleStartAssessment = () => {
    if (!isAuthenticated) {
      openAuthModal('login', '/assessment');
    } else {
      navigate('/assessment');
    }
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
        {/* Left Column: Typography & CTAs */}
        <div className="relative z-10 lg:col-span-7 space-y-6 text-left">
          <div
            className="animate-hero-reveal inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700"
            style={{ animationDelay: '0s' }}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>{t('home.badge')}</span>
          </div>

          <h1
            className="animate-hero-reveal text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.1]"
            style={{ animationDelay: '0.1s' }}
          >
            {t('home.headline')}
          </h1>

          <p
            className="animate-hero-reveal text-base sm:text-lg text-[#6B7280] max-w-2xl leading-relaxed"
            style={{ animationDelay: '0.2s' }}
          >
            {t('home.subtext')}
          </p>

          <p
            className="animate-hero-reveal text-xs sm:text-sm font-medium text-slate-500 flex items-center space-x-2"
            style={{ animationDelay: '0.3s' }}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{t('home.dataOptional')}</span>
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleStartAssessment}
              className="animate-hero-reveal w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              style={{ animationDelay: '0.4s' }}
            >
              <span>{t('home.startPrivately')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="animate-hero-reveal w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF9F6] text-slate-700 font-bold text-base rounded-xl border border-[#EDECE8] transition-all hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-1.5"
              style={{ animationDelay: '0.56s' }}
            >
              <span>{t('home.seeHowItWorks')}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Column: Sophisticated Abstract Dashboard Preview */}
        <div className="relative z-10 lg:col-span-5 w-full">
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Ambient subtle decorative light pill */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            {/* Soft moving light sweep across the card surface */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-card-sweep"></div>
            </div>

            {/* Panel Header */}
            <div className="border-b border-[#EDECE8] pb-4">
              <p className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-bold">
                {t('home.panelEyebrow')}
              </p>
              <h3 className="text-lg font-bold text-[#1A1A1A] mt-0.5">{t('home.panelTitle')}</h3>
            </div>

            {/* 5-Node Flow Visual: Income -> Transactions -> Patterns -> Context -> Insights */}
            <div className="space-y-0">
              {FLOW_NODES.map((node, idx, arr) => {
                const isActive = idx <= activeStep;
                const lineActive = idx + 1 <= activeStep;
                return (
                  <div key={node.key} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-[0_0_14px_rgba(79,70,229,0.45)]'
                            : 'bg-indigo-50 text-indigo-300'
                        }`}
                      >
                        <node.icon className="w-4 h-4" />
                      </div>
                      {idx < arr.length - 1 && (
                        <div
                          className={`w-px flex-1 my-1 transition-colors duration-500 ${
                            lineActive ? 'bg-indigo-400' : 'bg-stone-200'
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className={idx < arr.length - 1 ? 'pb-5' : ''}>
                      <span className="text-sm font-bold text-slate-900 block">{t(`home.flow.${node.key}.label`)}</span>
                      <span className="text-xs text-[#6B7280]">{t(`home.flow.${node.key}.desc`)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section
        id="how-it-works"
        ref={howItWorksReveal.ref}
        className={`scroll-mt-24 space-y-12 ${howItWorksReveal.inView ? 'animate-landing-reveal' : 'opacity-0'}`}
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">{t('home.howItWorks.eyebrow')}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:-translate-y-1 transition-all">
            <div className="space-y-4">
              <span className="text-4xl font-extrabold text-indigo-600 block">01</span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                {t('home.howItWorks.step1.title')}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {t('home.howItWorks.step1.desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDECE8] text-xs font-semibold text-indigo-600 flex items-center space-x-1">
              <span>{t('home.howItWorks.step1.footer')}</span>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:-translate-y-1 transition-all">
            <div className="space-y-4">
              <span className="text-4xl font-extrabold text-indigo-600 block">02</span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                {t('home.howItWorks.step2.title')}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {t('home.howItWorks.step2.desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDECE8] text-xs font-semibold text-indigo-600 flex items-center space-x-1">
              <span>{t('home.howItWorks.step2.footer')}</span>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:-translate-y-1 transition-all">
            <div className="space-y-4">
              <span className="text-4xl font-extrabold text-indigo-600 block">03</span>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                {t('home.howItWorks.step3.title')}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {t('home.howItWorks.step3.desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDECE8] text-xs font-semibold text-indigo-600 flex items-center space-x-1">
              <span>{t('home.howItWorks.step3.footer')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- WHY SAFEGUARD ---------------- */}
      <section
        ref={whySafeguardReveal.ref}
        className={`space-y-10 ${whySafeguardReveal.inView ? 'animate-landing-reveal' : 'opacity-0'}`}
      >
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
            {t('home.why.title')}
          </h2>
          <p className="text-sm text-[#6B7280]">
            {t('home.why.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{t('home.why.card1.title')}</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {t('home.why.card1.desc')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{t('home.why.card2.title')}</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {t('home.why.card2.desc')}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{t('home.why.card3.title')}</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {t('home.why.card3.desc')}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 shadow-sm space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{t('home.why.card4.title')}</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {t('home.why.card4.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- PRIVACY SECTION ---------------- */}
      <section
        id="privacy"
        ref={privacyReveal.ref}
        className={`scroll-mt-24 bg-white border border-[#EDECE8] rounded-[24px] p-8 sm:p-12 shadow-sm relative overflow-hidden ${privacyReveal.inView ? 'animate-landing-reveal' : 'opacity-0'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('home.privacy.badge')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              {t('home.privacy.title')}
            </h2>

            <p className="text-base text-[#6B7280] leading-relaxed">
              {t('home.privacy.desc')}
            </p>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t('home.privacy.pillar1.title')}</h4>
                <p className="text-xs text-[#6B7280]">{t('home.privacy.pillar1.desc')}</p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t('home.privacy.pillar2.title')}</h4>
                <p className="text-xs text-[#6B7280]">{t('home.privacy.pillar2.desc')}</p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t('home.privacy.pillar3.title')}</h4>
                <p className="text-xs text-[#6B7280]">{t('home.privacy.pillar3.desc')}</p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t('home.privacy.pillar4.title')}</h4>
                <p className="text-xs text-[#6B7280]">{t('home.privacy.pillar4.desc')}</p>
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
      <section
        ref={disclaimerReveal.ref}
        className={`bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-6 sm:p-8 text-center max-w-4xl mx-auto space-y-2 ${disclaimerReveal.inView ? 'animate-landing-reveal' : 'opacity-0'}`}
      >
        <div className="inline-flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>{t('home.disclaimer.badge')}</span>
        </div>
        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-3xl mx-auto">
          {t('home.disclaimer.text')}
        </p>
      </section>

      {/* ---------------- INTERACTIVE APP TOOLKIT BRIDGE ---------------- */}
      <section
        ref={toolkitReveal.ref}
        className={`space-y-6 pt-4 ${toolkitReveal.inView ? 'animate-landing-reveal' : 'opacity-0'}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EDECE8] pb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">{t('home.toolkit.title')}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('home.toolkit.subtitle')}
            </p>
          </div>
          <NavLink to="/assessment">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
              {t('home.toolkit.launchButton')}
            </button>
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavLink to="/assessment" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t('home.toolkit.card1.title')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.toolkit.card1.desc')}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>{t('home.toolkit.card1.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/financial-data" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t('home.toolkit.card2.title')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.toolkit.card2.desc')}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                  {t('home.toolkit.card2.cta')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
                {flaggedCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full">
                    {flaggedCount} {t('home.toolkit.flagged')}
                  </span>
                )}
              </div>
            </div>
          </NavLink>

          <NavLink to="/questionnaire" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t('home.toolkit.card3.title')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.toolkit.card3.desc')}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>{t('home.toolkit.card3.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/pattern-analysis" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t('home.toolkit.card4.title')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.toolkit.card4.desc')}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>{t('home.toolkit.card4.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/results" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t('home.toolkit.card5.title')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.toolkit.card5.desc')}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>{t('home.toolkit.card5.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>

          <NavLink to="/resources" className="group">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t('home.toolkit.card6.title')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.toolkit.card6.desc')}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>{t('home.toolkit.card6.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </NavLink>
        </div>
      </section>

      <ChatbotWidget />
    </div>
  );
};

