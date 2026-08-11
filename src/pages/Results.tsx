import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  Shield,
  Info,
  Lock,
  AlertCircle,
  BookOpen,
  Download,
  RotateCcw,
  CheckCircle2,
  Heart,
  ArrowRight,
  ArrowLeft,
  LifeBuoy,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { AIInsight } from '../components/common/AIInsight';
import { BackButton } from '../components/common/BackButton';
import { RadialProgress } from '../components/ui/Progress';
import { getMyAssessments, submitAssessment } from '../services/assessmentService';
import { SIGNAL_META, SIGNAL_ORDER, SEVERITY_BADGE } from '../services/signalMeta';
import { Assessment } from '../types';

interface PendingSubmission {
  statement: string;
  answers: Record<string, string>;
}

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { isDemoMode, resetDemo, user } = useSafeguard();

  const initialPending =
    (location.state as { pendingSubmission?: PendingSubmission } | null)?.pendingSubmission || null;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loadingAssessment, setLoadingAssessment] = useState<boolean>(!initialPending);
  const [pending] = useState<PendingSubmission | null>(initialPending);
  const [submitting, setSubmitting] = useState<boolean>(Boolean(initialPending));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);

  const submit = React.useCallback((statement: string, answers: Record<string, string>) => {
    setSubmitting(true);
    setSubmitError(null);
    submitAssessment(statement, answers)
      .then((result) => {
        setAssessment(result);
        // Clear router state so a refresh doesn't resubmit.
        navigate(location.pathname, { replace: true, state: null });
      })
      .catch((err) => {
        setSubmitError(
          err instanceof Error ? err.message : 'Something went wrong while generating your assessment.'
        );
      })
      .finally(() => setSubmitting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PENDING PATH: arriving fresh from Questionnaire with an unsaved
  // statement/answers pair — submit it to the backend once on mount. Guarded
  // by a ref (not just the effect's empty deps) so React StrictMode's dev-only
  // double-invoke can never create two Supabase rows for one submission.
  useEffect(() => {
    if (pending && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      submit(pending.statement, pending.answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FALLBACK PATH (unchanged behavior): returning user opening /results
  // directly, or a refresh after the pending state was already cleared.
  useEffect(() => {
    if (pending) return;
    if (!user) {
      setLoadingAssessment(false);
      return;
    }

    let isMounted = true;
    getMyAssessments()
      .then((assessments) => {
        if (!isMounted) return;
        if (assessments.length === 0) {
          addToast({
            title: 'No Assessment Found',
            description: 'Please complete the private reflection questionnaire first.',
            type: 'warning',
          });
          navigate('/questionnaire');
          return;
        }
        setAssessment(assessments[0]);
      })
      .catch((err) => {
        if (!isMounted) return;
        addToast({
          title: 'Could Not Load Your Assessment',
          description: err instanceof Error ? err.message : 'Please try again.',
          type: 'warning',
        });
        navigate('/questionnaire');
      })
      .finally(() => {
        if (isMounted) setLoadingAssessment(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRetry = () => {
    if (pending) submit(pending.statement, pending.answers);
  };

  // Active signal level (Low, Moderate, Higher) driven by the real backend risk assessment.
  // Computed before any early return so hook order stays stable across renders.
  const activeSignal: 'Low' | 'Moderate' | 'Higher' = React.useMemo(() => {
    const level = assessment?.analysis.risk.level;
    if (level === 'elevated' || level === 'high') return 'Higher';
    if (level === 'moderate') return 'Moderate';
    return 'Low';
  }, [assessment]);

  if (submitting) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Generating your assessment...</h2>
        <p className="text-sm text-slate-500 font-medium">
          Combining your responses with any provided financial patterns. This can take a moment.
        </p>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Couldn't generate your assessment</h2>
        <p className="text-sm text-slate-500">{submitError}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Try again
          </button>
          <button
            onClick={() => navigate('/questionnaire')}
            className="px-5 py-2.5 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-stone-200 transition-all cursor-pointer"
          >
            Back to questionnaire
          </button>
        </div>
      </div>
    );
  }

  if (loadingAssessment) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm animate-pulse">
          <Info className="w-8 h-8" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading your assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const { analysis } = assessment;

  // Same 0-100 "autonomy" framing (and formula) used on the Dashboard — higher
  // is better — so the score means the same thing everywhere it appears.
  const autonomyIndex = Math.round((1 - analysis.risk.normalizedScore) * 100);

  const detectedSignals = SIGNAL_ORDER.map((key) => [key, analysis.signals[key]] as const).filter(
    ([, signal]) => signal.detected
  );

  const SEVERITY_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 };
  const topSignal =
    detectedSignals.length > 0
      ? detectedSignals.reduce((worst, current) =>
          SEVERITY_WEIGHT[current[1].severity] > SEVERITY_WEIGHT[worst[1].severity] ? current : worst
        )
      : null;

  const CONFIDENCE_MAP: Record<string, 'High' | 'Medium' | 'Low'> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'Low',
  };

  const aiInsightProps = topSignal
    ? {
        pattern:
          topSignal[1].evidence ||
          `A pattern was identified in the "${SIGNAL_META[topSignal[0]].title}" category.`,
        context: SIGNAL_META[topSignal[0]].context,
        interpretation: SIGNAL_META[topSignal[0]].recommendation,
        limitation: 'These signals cannot establish intent, coercion, or whether financial abuse occurred.',
        patternConfidence: CONFIDENCE_MAP[topSignal[1].severity],
        confidenceExplanation: `This was categorized as "${SIGNAL_META[topSignal[0]].title}" with ${topSignal[1].severity} severity based on the evidence found in your responses.`,
        whyAmISeeingThis:
          'Safeguard correlates detected pattern categories in your responses (and any optional financial data you provided) to highlight points for personal reflection.',
        whatDataDoesNotTellMe:
          'These signals cannot explain personal arrangements, shared household agreements, or the underlying reasons behind your answers. Only you know your full context.',
      }
    : undefined;

  const handleSaveResults = () => {
    const reportText = `SAFEGUARD FINANCIAL AUTONOMY OVERVIEW
Date: ${new Date().toLocaleDateString()}
Status: Informational Assessment Summary (Non-Diagnostic)

OVERALL SIGNAL: ${activeSignal}
"This level represents the combination of selected patterns and questionnaire responses. It is not a diagnosis or prediction."

KEY BREAKDOWN:
1. Financial access:
   - Observation: Your responses indicate that access to money may sometimes be limited.
   - Context: Essential liquidity enables independence during unexpected personal needs.
   - Recommendation: Consider maintaining small, accessible personal reserves.

2. Financial decision-making:
   - Observation: You indicated that you may not always have complete control over financial decisions.
   - Context: Shared decision-making works best with mutual transparency and voluntary agreement.
   - Recommendation: Review which financial choices you feel comfortable discussing independently.

3. Transaction patterns:
   - Observation: Several unusual withdrawal patterns were identified in the optional financial data.
   - Context: Cash transactions are common but reduce digital auditability over time.
   - Recommendation: Periodically review transaction histories to stay informed.

RECOMMENDATIONS FOR REFLECTION:
- Review your financial access: Consider whether you can access essential funds when needed.
- Understand your accounts: Make sure you know which accounts and services you have access to.
- Consider speaking with someone you trust: If you feel uncomfortable or pressured about finances, consider seeking appropriate support.

SAFETY NOTICE:
"If you are in immediate danger, contact appropriate local emergency or support services."

DISCLAIMER:
"Your results are informational and should not be treated as legal, medical, or professional advice."
==================================================
Generated locally via Safeguard. Zero data saved on external servers.`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safeguard-autonomy-overview-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'Results Saved Locally',
      description: 'An informational text file has been exported to your downloads folder.',
      type: 'success',
    });
  };

  const handleStartNewAssessment = () => {
    // Clear local questionnaire/demo/transaction context so the new run
    // starts clean, then send the user back to Privacy & Consent (step 1).
    resetDemo();
    addToast({
      title: 'Starting New Assessment',
      description: 'Previous responses cleared. Redirecting to Privacy & Consent.',
      type: 'info',
    });
    navigate('/assessment');
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-4 sm:py-6">
      <BackButton fallbackPath="/questionnaire" />
      {/* HEADER */}
      <div className="space-y-3 border-b border-stone-200 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
            Assessment complete
          </span>
          <span className="px-3 py-1 bg-stone-100 text-slate-700 border border-stone-200 rounded-full text-xs font-bold uppercase tracking-wider">
            Informational Assessment
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your financial autonomy overview
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Based on the information you chose to provide.
        </p>
      </div>

      {isDemoMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-amber-500/20 rounded-full font-extrabold text-xs uppercase tracking-wider shrink-0">
              Demo data — fictional
            </span>
            <span className="text-xs font-medium text-amber-900/90">
              Profile: Maya Sharma (₹45,000 monthly income, 6 months transaction history)
            </span>
          </div>
          <button
            onClick={() => {
              resetDemo();
              addToast({ title: 'Demo Reset', description: 'Restored standard clean state.', type: 'info' });
              navigate('/');
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset demo</span>
          </button>
        </div>
      )}

      {/* RESULT CARD */}
      <div className="bg-white border border-stone-200 rounded-[28px] p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden">
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <RadialProgress
            value={autonomyIndex}
            size={140}
            strokeWidth={11}
            variant="indigo"
            sublabel="Financial Autonomy"
          />

          <div className="flex-1 space-y-4 text-center sm:text-left">
            <span className="px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-extrabold inline-flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Informational Signal</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Some areas may be worth reviewing
            </h2>

            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-3xl">
              Your responses and selected financial patterns suggest that you may want to take a closer look at your financial autonomy.
            </p>
          </div>
        </div>

        {/* IMPORTANT DISCLAIMER */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start space-x-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-slate-900 block">Informational Disclaimer</strong>
            <p>This is an informational assessment, not a diagnosis. These signals cannot establish intent, coercion, or whether financial abuse occurred.</p>
            <p className="text-xs font-bold text-indigo-700 pt-1">
              "Patterns are signals, not conclusions."
            </p>
          </div>
        </div>

        {/* OVERALL SIGNAL / RISK LEVEL SELECTOR */}
        <div className="pt-4 border-t border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Overall signal
              </span>
              <div className="text-2xl font-extrabold text-indigo-900 mt-0.5">
                {activeSignal}
              </div>
            </div>

            {/* Three signal level tabs (Read-Only) */}
            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              {(['Low', 'Moderate', 'Higher'] as const).map((level) => (
                <span
                  key={level}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all select-none ${
                    activeSignal === level
                      ? 'bg-white text-indigo-900 shadow-xs border border-stone-200'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  {level}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed italic">
            This level represents the combination of selected patterns and questionnaire responses. It is not a diagnosis or prediction.
          </p>
        </div>
      </div>

      {/* AI INSIGHT LAYER */}
      <AIInsight {...(aiInsightProps || {})} />

      {/* BREAKDOWN CARDS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Assessment Breakdown</h3>

        {detectedSignals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {detectedSignals.map(([key, signal], index) => {
              const meta = SIGNAL_META[key];
              const badge = SEVERITY_BADGE[signal.severity];
              return (
                <div
                  key={key}
                  className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                        {`Domain ${String(index + 1).padStart(2, '0')}`}
                      </span>
                      <span className={badge.className}>{badge.label}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{meta.title}</h4>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                          Observation
                        </span>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed mt-0.5">
                          {signal.evidence || 'This pattern was identified from your responses.'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                          Context
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{meta.context}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide block">
                      Neutral Recommendation
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{meta.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-xs">
            <p className="text-sm text-slate-600 leading-relaxed">
              No specific patterns were identified from your responses.
            </p>
          </div>
        )}
      </div>

      {/* AI EXPLANATION */}
      <div className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">What does this mean?</h3>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed pl-10">
          Financial patterns can highlight situations worth reviewing, but they cannot tell us why a transaction happened. Your responses provide context that transaction records cannot.
        </p>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Practical Steps for Reflection</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Review your financial access</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consider whether you can access essential funds when needed.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Understand your accounts</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Make sure you know which accounts and services you have access to.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Consider speaking with someone you trust</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you feel uncomfortable or pressured about finances, consider seeking appropriate support.
            </p>
          </div>
        </div>
      </div>

      {/* SUPPORT SECTION */}
      <div className="bg-stone-50 border border-stone-200 rounded-[28px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
            <Heart className="w-4 h-4 text-indigo-600" />
            <span>Support & Guidance</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            You don't have to figure everything out alone.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Confidential helplines, financial counselors, and community organizations can offer personalized advice in a safe environment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          <NavLink to="/resources" className="w-full sm:w-auto">
            <button className="w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer">
              <BookOpen className="w-4 h-4" />
              <span>Explore resources</span>
            </button>
          </NavLink>

          <button
            onClick={handleSaveResults}
            className="w-full px-5 py-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-stone-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Save my results</span>
          </button>
        </div>
      </div>

      {/* SAFETY NOTICE (NOT ALARMING) */}
      <div className="p-4 bg-stone-100/80 border border-stone-200/90 rounded-2xl text-xs text-slate-600 leading-relaxed flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <Shield className="w-4 h-4 text-slate-500 shrink-0" />
          <span>If you are in immediate danger, contact appropriate local emergency or support services.</span>
        </div>
        <NavLink
          to="/resources"
          className="text-indigo-700 hover:text-indigo-900 font-bold underline text-[12px] whitespace-nowrap shrink-0"
        >
          View Helplines
        </NavLink>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={handleContinueToDashboard}
          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleStartNewAssessment}
          className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-stone-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start new assessment</span>
        </button>

        {isDemoMode && (
          <button
            onClick={() => {
              resetDemo();
              addToast({ title: 'Demo Reset', description: 'Restored standard clean state.', type: 'info' });
              navigate('/');
            }}
            className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset demo</span>
          </button>
        )}
      </div>

      {/* CLOSING PHILOSOPHY CARD */}
      <div className="bg-stone-100/70 border border-stone-200/80 rounded-[20px] p-5 text-center space-y-1">
        <p className="text-xs font-bold text-slate-800">
          "Technology can help identify patterns, but people remain in control."
        </p>
        <p className="text-[12px] text-slate-500">
          Safeguard is designed as an empowered, private decision-support tool.
        </p>
      </div>

      {/* FOOTER DISCLAIMER */}
      <p className="text-[12px] text-slate-400 text-center pt-2">
        Your results are informational and should not be treated as legal, medical, or professional advice.
      </p>
    </div>
  );
};

export default Results;
