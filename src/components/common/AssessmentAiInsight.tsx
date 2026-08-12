import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Radar, MessagesSquare } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { generateAiInsight } from '../../services/aiInsightService';
import { SEVERITY_BADGE_CLASS } from '../../services/signalMeta';
import { AiInsightResult, AnalysisRisk, AnalysisSeverity, AnalysisSignals } from '../../types';

export interface AssessmentAiInsightProps {
  signals: AnalysisSignals;
  risk: AnalysisRisk;
  questionnaireAnswers: Record<string, string>;
}

type Status = 'loading' | 'success' | 'insufficient' | 'error';

const SEVERITY_RANK: Record<AnalysisSeverity, number> = { none: 0, low: 1, medium: 2, high: 3 };

// Replaces the old static AI-assisted box on the Financial Autonomy Report
// page with real Gemini output — grounded exclusively in this user's own
// detected signals, risk score, and questionnaire answers (see
// aiInsightService.ts). "Observed Pattern" and "User Context" are each
// paired with real, non-AI grounding (the actual top severity / actual
// answer count) so the visual never implies the model invented anything.
export const AssessmentAiInsight: React.FC<AssessmentAiInsightProps> = ({ signals, risk, questionnaireAnswers }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [insight, setInsight] = useState<AiInsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const topSeverity = Object.values(signals).reduce<AnalysisSeverity>(
    (worst, s) => (SEVERITY_RANK[s.severity] > SEVERITY_RANK[worst] ? s.severity : worst),
    'none'
  );
  const answeredCount = Object.keys(questionnaireAnswers).length;

  const runInsight = useCallback(() => {
    setStatus('loading');
    setError(null);
    generateAiInsight({
      signals,
      risk,
      questionnaireAnswers: answeredCount > 0 ? questionnaireAnswers : undefined,
    })
      .then((outcome) => {
        if (outcome.insufficientData || !outcome.insight) {
          setStatus('insufficient');
          return;
        }
        setInsight(outcome.insight);
        setStatus('success');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('assessmentAiInsight.errorGeneric'));
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signals, risk, questionnaireAnswers]);

  // Guarded by a ref (not just an empty dep array) so React StrictMode's
  // dev-only double-invoke never fires two Gemini requests for one mount.
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    runInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] font-extrabold uppercase tracking-wider text-indigo-700 block">
              {t('assessmentAiInsight.badge')}
            </span>
            <p className="text-[12px] text-slate-500">{t('assessmentAiInsight.poweredBy')}</p>
          </div>
        </div>

        {status === 'success' && (
          <button
            onClick={runInsight}
            title={t('assessmentAiInsight.refresh')}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {status === 'loading' && (
        <div className="py-2 space-y-3 animate-fade-in" aria-live="polite">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">{t('assessmentAiInsight.loading')}</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-2xl bg-stone-100 animate-pulse"></div>
            <div className="h-14 rounded-2xl bg-stone-100 animate-pulse"></div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">{error}</p>
          <button
            onClick={runInsight}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('assessmentAiInsight.retry')}</span>
          </button>
        </div>
      )}

      {status === 'insufficient' && (
        <div className="py-6 text-center space-y-2 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-slate-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t('assessmentAiInsight.insufficientData')}
          </p>
        </div>
      )}

      {status === 'success' && insight && (
        <div className="space-y-4 animate-fade-in">
          {/* OBSERVED PATTERN */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 flex items-center space-x-1.5">
                <Radar className="w-3.5 h-3.5" />
                <span>{t('assessmentAiInsight.observedPattern')}</span>
              </span>
              {topSeverity !== 'none' && (
                <span className={SEVERITY_BADGE_CLASS[topSeverity]}>{t(`signalMeta.severity.${topSeverity}`)}</span>
              )}
            </div>
            <p className="text-sm font-bold text-indigo-950 leading-snug">{insight.keyFinding}</p>
            {insight.patternExplanation && (
              <p className="text-xs text-indigo-900/80 leading-relaxed">{insight.patternExplanation}</p>
            )}
          </div>

          {/* USER CONTEXT */}
          <div className="p-4 bg-[#FAF9F6] border border-stone-200 rounded-2xl space-y-2 hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <MessagesSquare className="w-3.5 h-3.5" />
                <span>{t('assessmentAiInsight.userContext')}</span>
              </span>
              {answeredCount > 0 && (
                <span className="text-[11px] font-bold text-slate-400">
                  {t('assessmentAiInsight.questionsAnswered', {
                    count: String(answeredCount),
                    plural: answeredCount === 1 ? '' : 's',
                  })}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{insight.whatDataSuggests}</p>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">{t('assessmentAiInsight.disclaimer')}</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentAiInsight;
