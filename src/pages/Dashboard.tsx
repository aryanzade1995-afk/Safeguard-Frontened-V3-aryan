import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ClipboardList,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Lock,
  Wallet,
  Repeat,
  Activity,
  HeartPulse,
  History,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  BarChart2,
  Shield,
  RefreshCw,
  Puzzle,
  Search,
  Brain,
  Trash2,
} from 'lucide-react';
import { useSafeguard } from '../context/SafeguardContext';
import { useTranslation } from '../hooks/useTranslation';
import { Progress } from '../components/ui/Progress';
import { FinancialWellbeingCard } from '../components/common/FinancialWellbeingCard';
import { getMyAssessments } from '../services/assessmentService';
import { getFinancialHealth } from '../services/financialHealthService';
import { Assessment, FinancialHealthData } from '../types';

const DASHBOARD_SECTIONS = [
  { id: 'financial-health', labelKey: 'dashboard.sections.financialHealth', icon: HeartPulse },
  { id: 'what-changed', labelKey: 'dashboard.sections.whatChanged', icon: History },
  { id: 'safety-privacy', labelKey: 'dashboard.sections.safetyPrivacy', icon: ShieldCheck },
  { id: 'resources-panel', labelKey: 'dashboard.sections.resources', icon: BookOpen },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const formatAssessmentDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    user,
    authLoading,
    isAuthenticated,
    openAuthModal,
    isDemoMode,
    questionnaireAnswers,
  } = useSafeguard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  // Starts true and only ever resolves once auth has settled — this is what
  // stops the "no assessment yet" screen from flashing before we actually
  // know who's signed in and whether they have saved data (see the effect
  // below and the combined authLoading/assessmentsLoading gate further down).
  const [assessmentsLoading, setAssessmentsLoading] = useState<boolean>(true);
  const [assessmentsError, setAssessmentsError] = useState<string | null>(null);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthData | null>(null);
  const [financialHealthLoading, setFinancialHealthLoading] = useState<boolean>(true);
  const [assessmentsReloadKey, setAssessmentsReloadKey] = useState(0);

  useEffect(() => {
    // Auth hasn't resolved yet — stay in the loading state rather than
    // treating "no user" (which is only true so far) as "no assessments".
    if (authLoading) return;

    if (!user) {
      setAssessmentsLoading(false);
      setAssessments([]);
      setAssessmentsError(null);
      return;
    }

    let isMounted = true;
    setAssessmentsLoading(true);
    setAssessmentsError(null);
    getMyAssessments()
      .then((list) => {
        if (isMounted) setAssessments(list);
      })
      .catch(() => {
        if (isMounted) {
          setAssessmentsError(t('dashboard.error.loadFailed'));
        }
      })
      .finally(() => {
        if (isMounted) setAssessmentsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, assessmentsReloadKey]);

  // Reuses the existing FastAPI financial-health service (already wired for
  // PatternAnalysis) purely to know whether real bank-statement data exists,
  // for the new-user onboarding progress tracker below.
  useEffect(() => {
    if (!user?.id) {
      setFinancialHealthLoading(false);
      return;
    }
    let isMounted = true;
    getFinancialHealth(user.id)
      .then((data) => {
        if (isMounted) setFinancialHealth(data);
      })
      .catch(() => {
        // Non-fatal — onboarding progress just treats it as not-yet-provided.
      })
      .finally(() => {
        if (isMounted) setFinancialHealthLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleStartAssessment = () => {
    if (!isAuthenticated) {
      openAuthModal('login', '/assessment');
    } else {
      navigate('/assessment');
    }
  };

  // ONBOARDING PROGRESS — every flag below is a real, already-available
  // signal (never hardcoded): demo/real financial data, saved questionnaire
  // answers, and saved assessments.
  const financialDataProvided = isDemoMode || Boolean(financialHealth);
  const questionsDone = Object.keys(questionnaireAnswers).length > 0;
  const reviewDone = Boolean(financialHealth);
  const assessmentDone = assessments.length > 0;
  const progressSteps = [
    { label: t('dashboard.newUser.steps.financialData'), done: financialDataProvided },
    { label: t('dashboard.newUser.steps.privateQuestions'), done: questionsDone },
    { label: t('dashboard.newUser.steps.review'), done: reviewDone },
    { label: t('dashboard.newUser.steps.assessment'), done: assessmentDone },
  ];
  const completedCount = progressSteps.slice(0, 3).filter((s) => s.done).length;
  const readinessPercent = Math.round((completedCount / 3) * 100);
  const readinessCaption =
    readinessPercent === 0
      ? t('dashboard.newUser.readinessCaption.start')
      : readinessPercent === 100
        ? t('dashboard.newUser.readinessCaption.ready')
        : readinessPercent >= 67
          ? t('dashboard.newUser.readinessCaption.almost')
          : t('dashboard.newUser.readinessCaption.progress');

  const isNewUser = !authLoading && !assessmentsLoading && !assessmentsError && assessments.length === 0;

  // FINANCIAL HEALTH — sourced exclusively from the real backend analysis
  // (getFinancialHealth, above). Never fabricated: each value is null until
  // an actual analysis exists for this user, and the UI renders "—" for it.
  const monthlySpendingValue = financialHealth ? financialHealth.summary.monthly_spending : null;
  const recurringTransfersValue = financialHealth ? financialHealth.indicators.recurring_transfers.count : null;
  const patternsIdentifiedValue = financialHealth ? financialHealth.patterns.length : null;

  // Avoid a flash of the onboarding hero before we actually know whether
  // this user has a saved assessment. Waits on BOTH auth resolving and the
  // assessment fetch completing — resolving only one of the two is what
  // previously let "Start your assessment" flash for existing users.
  if (authLoading || assessmentsLoading) {
    return (
      <div className="max-w-5xl w-full mx-auto py-16 px-4 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-3 max-w-xs mx-auto">
          <p className="text-sm text-slate-500 font-medium">{t('dashboard.loading')}</p>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60 relative">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-400 animate-progress-indeterminate" />
          </div>
        </div>
      </div>
    );
  }

  // API errors are shown distinctly from "no assessment found" — a fetch
  // failure must never be silently read as "you're a new user".
  if (assessmentsError) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('dashboard.error.title')}</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">{assessmentsError}</p>
        </div>
        <button
          onClick={() => setAssessmentsReloadKey((k) => k + 1)}
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('dashboard.error.tryAgain')}</span>
        </button>
      </div>
    );
  }

  // NEW-USER ONBOARDING OVERVIEW — shown only when there is no saved
  // assessment yet. Existing users keep the unchanged dashboard below.
  if (isNewUser) {
    return (
      <div className="max-w-5xl w-full mx-auto space-y-12 py-4 sm:py-6">
        {/* HERO */}
        <div className="bg-white border border-[#EDECE8] rounded-[28px] p-8 sm:p-12 shadow-sm relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800"></div>

          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
              {t('dashboard.newUser.title')}
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              {t('dashboard.newUser.subtitle')}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleStartAssessment}
              className="inline-flex items-center space-x-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <span>{t('dashboard.newUser.startBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-400 font-medium">{t('dashboard.newUser.duration')}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500 pt-1">
            <span className="inline-flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('dashboard.newUser.private')}</span>
            </span>
            <span className="text-stone-300">·</span>
            <span className="inline-flex items-center space-x-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('dashboard.newUser.evidenceBased')}</span>
            </span>
            <span className="text-stone-300">·</span>
            <span className="inline-flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('dashboard.newUser.youControl')}</span>
            </span>
          </div>
        </div>

        {/* ASSESSMENT PROGRESS */}
        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#1A1A1A]">{t('dashboard.newUser.yourAssessment')}</h2>
            <span className="text-xs font-bold text-slate-500">
              {t('dashboard.newUser.completed', { count: String(completedCount) })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {progressSteps.map((step, idx) => (
              <div key={step.label} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-colors ${
                    step.done
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-[#EDECE8]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{t('dashboard.newUser.readiness')}</span>
              <span className="text-indigo-600">{readinessPercent}%</span>
            </div>
            <Progress value={readinessPercent} variant="indigo" size="md" />
            <p className="text-xs text-slate-500">{readinessCaption}</p>
          </div>
        </div>

        {/* WHAT YOU'LL DISCOVER */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">{t('dashboard.newUser.discoverTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.discover.card1.title')}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t('dashboard.newUser.discover.card1.desc')}
              </p>
            </div>

            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.discover.card2.title')}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-2">
                {t('dashboard.newUser.discover.card2.desc')}
              </p>
              <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                {(['0', '1', '2', '3'] as const).map((i) => (
                  <li key={i}>{t(`dashboard.newUser.discover.card2.list.${i}`)}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Puzzle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.discover.card3.title')}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t('dashboard.newUser.discover.card3.desc')}
              </p>
            </div>

            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.discover.card4.title')}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t('dashboard.newUser.discover.card4.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* PRIVACY PREVIEW */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">{t('dashboard.newUser.controlTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.control.card1.title')}</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                {(['0', '1', '2'] as const).map((i) => (
                  <li key={i}>{t(`dashboard.newUser.control.card1.list.${i}`)}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.control.card2.title')}</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                {(['0', '1', '2', '3', '4'] as const).map((i) => (
                  <li key={i}>{t(`dashboard.newUser.control.card2.list.${i}`)}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('dashboard.newUser.control.card3.title')}</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                {(['0', '1', '2', '3'] as const).map((i) => (
                  <li key={i}>{t(`dashboard.newUser.control.card3.list.${i}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto space-y-10 py-4 sm:py-6">
      {/* GREETING + QUICK LINKS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {getGreeting()}{user?.name ? `, ${user.name}` : ''}.
          </h1>
          <p className="text-sm text-[#1A1A1A]">
            Your financial wellbeing and autonomy at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t('dashboard.startAssessment')}</span>
          </button>
          <button
            onClick={() => navigate('/pattern-analysis')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('dashboard.reviewPatterns')}</span>
          </button>
        </div>
      </div>

      {/* IN-PAGE QUICK LINKS TO DASHBOARD SECTIONS */}
      <nav
        aria-label="Dashboard sections"
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
      >
        {DASHBOARD_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-[#EDECE8] hover:border-indigo-300 hover:text-indigo-700 text-slate-600 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <section.icon className="w-3.5 h-3.5" />
            <span>{t(section.labelKey)}</span>
          </button>
        ))}
      </nav>

      {/* FINANCIAL WELLBEING — where am I / what has changed / what can I do,
          all derived from the user's real saved assessment history */}
      <FinancialWellbeingCard assessments={assessments} />

      {/* FINANCIAL HEALTH — METRICS GRID */}
      <div id="financial-health" className="space-y-4 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#1A1A1A]">{t('dashboard.sections.financialHealth')}</h3>
          <button
            onClick={() => navigate('/pattern-analysis')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
          >
            <span>{t('dashboard.viewReport')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EDECE8] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('dashboard.monthlySpending')}
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              {monthlySpendingValue !== null ? `₹${Math.round(monthlySpendingValue).toLocaleString('en-IN')}` : '—'}
            </div>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('dashboard.recurringTransfers')}
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              {recurringTransfersValue !== null ? recurringTransfersValue : '—'}
            </div>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('dashboard.patternsIdentified')}
            </span>
            <div className="text-xl font-extrabold text-indigo-700">
              {patternsIdentifiedValue !== null ? patternsIdentifiedValue : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* SAFETY & PRIVACY + RESOURCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
        <NavLink
          id="safety-privacy"
          to="/settings/privacy"
          className="bg-indigo-950 text-white rounded-[24px] p-6 shadow-xs flex flex-col justify-between space-y-6 group hover:bg-indigo-900 transition-colors scroll-mt-24"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold">{t('dashboard.safetyPrivacyCard.title')}</h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              {t('dashboard.safetyPrivacyCard.desc')}
            </p>
          </div>
          <div className="flex items-center text-xs font-bold space-x-1 group-hover:translate-x-1 transition-transform">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('dashboard.safetyPrivacyCard.cta')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NavLink>

        <NavLink
          id="resources-panel"
          to="/resources"
          className="bg-[#FAF9F6] border border-[#EDECE8] rounded-[24px] p-6 shadow-xs flex flex-col justify-between space-y-6 group hover:border-indigo-300 transition-colors scroll-mt-24"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">{t('dashboard.resourcesCard.title')}</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              {t('dashboard.resourcesCard.desc')}
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-indigo-600 space-x-1 group-hover:translate-x-1 transition-transform">
            <span>{t('dashboard.resourcesCard.cta')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NavLink>
      </div>

      {/* BOTTOM PRIVACY REMINDER */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#9CA3AF] font-medium">
          {t('dashboard.bottomReminder')}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
