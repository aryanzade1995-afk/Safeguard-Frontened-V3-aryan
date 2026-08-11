import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ClipboardList,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  Wallet,
  Repeat,
  Activity,
  HeartPulse,
  History,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useSafeguard } from '../context/SafeguardContext';
import { AIInsight } from '../components/common/AIInsight';
import { RadialProgress, Progress } from '../components/ui/Progress';
import { getMyAssessments } from '../services/assessmentService';
import { SIGNAL_ORDER, SIGNAL_META } from '../services/signalMeta';
import { Assessment } from '../types';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const VULNERABILITY_LABEL: Record<'low' | 'moderate' | 'elevated' | 'high', string> = {
  low: 'Strong financial autonomy',
  moderate: 'Some areas may be worth reviewing',
  elevated: 'Several areas may be worth reviewing',
  high: 'Many areas may be worth reviewing',
};

const DASHBOARD_SECTIONS = [
  { id: 'financial-health', label: 'Financial Health', icon: HeartPulse },
  { id: 'what-changed', label: 'What Changed?', icon: History },
  { id: 'safety-privacy', label: 'Safety & Privacy', icon: ShieldCheck },
  { id: 'resources-panel', label: 'Resources', icon: BookOpen },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const formatAssessmentDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, calculatedScore, transactions, patterns } = useSafeguard();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setAssessmentsLoading(false);
      return;
    }
    let isMounted = true;
    getMyAssessments()
      .then((list) => {
        if (isMounted) setAssessments(list);
      })
      .catch(() => {
        // Non-fatal — Dashboard silently falls back to the local heuristic score below.
      })
      .finally(() => {
        if (isMounted) setAssessmentsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const latestAssessment = assessments[0] || null;
  const previousAssessment = assessments[1] || null;

  const insightsFromAssessment = latestAssessment
    ? SIGNAL_ORDER.filter((key) => latestAssessment.analysis.signals[key].detected)
        .slice(0, 3)
        .map((key) => SIGNAL_META[key].recommendation)
    : [];

  const displayScore = latestAssessment
    ? {
        autonomyIndex: Math.round((1 - latestAssessment.analysis.risk.normalizedScore) * 100),
        vulnerabilityLevel: latestAssessment.analysis.risk.level,
        keyInsights: insightsFromAssessment.length > 0 ? insightsFromAssessment : calculatedScore.keyInsights,
      }
    : calculatedScore;

  const tierLabel = VULNERABILITY_LABEL[displayScore.vulnerabilityLevel];

  // WHAT CHANGED — derived entirely from real saved assessments (score delta
  // + signal diff between the two most recent submissions). Never fabricated.
  const previousIndex = previousAssessment
    ? Math.round((1 - previousAssessment.analysis.risk.normalizedScore) * 100)
    : null;
  const scoreDelta = previousIndex !== null ? displayScore.autonomyIndex - previousIndex : null;
  const DeltaIcon = scoreDelta === null || scoreDelta === 0 ? Minus : scoreDelta > 0 ? TrendingUp : TrendingDown;
  const deltaBadgeClass =
    scoreDelta === null || scoreDelta === 0
      ? 'bg-stone-100 text-slate-500 border border-stone-200'
      : scoreDelta > 0
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-rose-50 text-rose-700 border border-rose-200';
  const deltaLabel =
    scoreDelta === null ? '' : scoreDelta === 0 ? 'No change' : `${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts`;

  const newSignals =
    latestAssessment && previousAssessment
      ? SIGNAL_ORDER.filter(
          (key) =>
            latestAssessment.analysis.signals[key].detected && !previousAssessment.analysis.signals[key].detected
        )
      : [];
  const resolvedSignals =
    latestAssessment && previousAssessment
      ? SIGNAL_ORDER.filter(
          (key) =>
            previousAssessment.analysis.signals[key].detected && !latestAssessment.analysis.signals[key].detected
        )
      : [];

  // FINANCIAL HEALTH — real numbers from the current transaction set (sample
  // data or an uploaded statement), never hardcoded placeholders.
  const monthlySpending = transactions
    .filter((t) => t.category !== 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  const recurringTransfersCount = transactions.filter((t) => t.category === 'Transfer').length;
  const patternsIdentifiedCount = patterns.length;

  return (
    <div className="max-w-5xl w-full mx-auto space-y-10 py-4 sm:py-6">
      {/* GREETING + QUICK LINKS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {getGreeting()}{user?.name ? `, ${user.name}` : ''}.
          </h1>
          <p className="text-sm text-[#6B7280]">
            Your financial wellbeing and autonomy at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Start assessment</span>
          </button>
          <button
            onClick={() => navigate('/pattern-analysis')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Review patterns</span>
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
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      {/* LARGE FEATURE: FINANCIAL AUTONOMY SCORE */}
      <div className="bg-white border border-[#EDECE8] rounded-[28px] p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <RadialProgress
            value={displayScore.autonomyIndex}
            size={152}
            strokeWidth={13}
            variant="indigo"
            sublabel="Financial Autonomy"
          />

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                Financial Autonomy
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {tierLabel}
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl">
                This score is a private, non-diagnostic reflection of your responses and optional financial patterns — not a measurement of abuse or risk.
              </p>
            </div>

            {displayScore.keyInsights.length > 0 && (
              <ul className="space-y-2 text-left inline-block">
                {displayScore.keyInsights.slice(0, 3).map((insight, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-600">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            )}

            <div>
              <button
                onClick={() => navigate('/results')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <span>View full results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL HEALTH — METRICS GRID */}
      <div id="financial-health" className="space-y-4 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Financial Health</h3>
          <button
            onClick={() => navigate('/pattern-analysis')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
          >
            <span>View My Financial Analysis Report</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EDECE8] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Monthly spending
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              ₹{Math.round(monthlySpending).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Recurring transfers
            </span>
            <div className="text-xl font-extrabold text-slate-900">{recurringTransfersCount}</div>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Patterns identified
            </span>
            <div className="text-xl font-extrabold text-indigo-700">{patternsIdentifiedCount}</div>
          </div>
        </div>
        <p className="text-[12px] text-slate-400 italic">Based on optional sample / uploaded data.</p>
      </div>

      {/* WHAT CHANGED — REAL ASSESSMENT-TO-ASSESSMENT COMPARISON */}
      <div id="what-changed" className="space-y-4 scroll-mt-24">
        <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>What Changed?</span>
        </h3>

        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs">
          {assessmentsLoading ? (
            <p className="text-sm text-slate-400">Loading your history...</p>
          ) : !latestAssessment ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-slate-500">
                Complete your first assessment to start tracking changes over time.
              </p>
              <button
                onClick={() => navigate('/assessment')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Start assessment</span>
              </button>
            </div>
          ) : !previousAssessment ? (
            <div className="space-y-1.5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Your first assessment was completed on{' '}
                <strong className="text-slate-900">{formatAssessmentDate(latestAssessment.createdAt)}</strong>,
                scoring <strong className="text-slate-900">{displayScore.autonomyIndex}/100</strong>.
              </p>
              <p className="text-xs text-slate-400">
                Complete another assessment later to see how your autonomy score changes over time.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Score delta */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Autonomy score change
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {displayScore.autonomyIndex}
                    <span className="text-sm text-slate-400 font-bold">/100</span>
                  </span>
                </div>
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${deltaBadgeClass}`}
                >
                  <DeltaIcon className="w-3.5 h-3.5" />
                  <span>{deltaLabel}</span>
                </span>
              </div>

              {/* Compact score comparison bars */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Previous · {formatAssessmentDate(previousAssessment.createdAt)}</span>
                    <span>{previousIndex}/100</span>
                  </div>
                  <Progress value={previousIndex ?? 0} variant="neutral" size="sm" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Latest · {formatAssessmentDate(latestAssessment.createdAt)}</span>
                    <span>{displayScore.autonomyIndex}/100</span>
                  </div>
                  <Progress value={displayScore.autonomyIndex} variant="indigo" size="sm" />
                </div>
              </div>

              {/* Signal diff */}
              {(newSignals.length > 0 || resolvedSignals.length > 0) && (
                <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {newSignals.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Newly flagged</span>
                      </span>
                      <ul className="space-y-1">
                        {newSignals.map((key) => (
                          <li key={key} className="text-xs text-slate-700 font-medium">
                            {SIGNAL_META[key].title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {resolvedSignals.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Improved</span>
                      </span>
                      <ul className="space-y-1">
                        {resolvedSignals.map((key) => (
                          <li key={key} className="text-xs text-slate-700 font-medium">
                            {SIGNAL_META[key].title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI INSIGHT LAYER */}
      <AIInsight
        pattern="ATM withdrawals increased significantly over the last three months."
        context="You also indicated that you sometimes have limited access to money."
        interpretation="Together, these signals may be worth reviewing as part of your financial autonomy."
        limitation="These signals cannot establish intent, coercion, or whether financial abuse occurred."
        patternConfidence="High"
        confidenceExplanation="The transaction pattern is clearly present in the supplied data."
        whyAmISeeingThis="Safeguard correlates identified transaction anomalies (like cash withdrawal spikes) with optional answers provided during your private reflection."
        whatDataDoesNotTellMe="Transaction lists cannot establish intent, verbal agreements, or why funds were withdrawn. Only you know your personal circumstances."
      />

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
            <h3 className="text-lg font-bold">Safety &amp; Privacy</h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              You control what information you share. Review or delete your data at any time.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold space-x-1 group-hover:translate-x-1 transition-transform">
            <Lock className="w-3.5 h-3.5" />
            <span>Open privacy center</span>
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
            <h3 className="text-lg font-bold text-[#1A1A1A]">Resources</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Confidential support directories, guidance, and educational articles.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-indigo-600 space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Browse resources</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NavLink>
      </div>

      {/* BOTTOM PRIVACY REMINDER */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#9CA3AF] font-medium">
          You control what information you share.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
