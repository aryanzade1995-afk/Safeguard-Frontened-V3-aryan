import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Lightbulb, TrendingUp, CheckCircle2, Eye } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { generateAiInsight } from '../../services/aiInsightService';
import { AiInsightResult, FinancialHealthData } from '../../types';

export interface AiFinancialInsightProps {
  health: FinancialHealthData;
  questionnaireAnswers: Record<string, string>;
}

type Status = 'loading' | 'success' | 'insufficient' | 'error';

// Replaces the old static AI-assisted insight card on the Financial Pattern
// Overview page with a real Gemini-generated one — grounded exclusively in
// this user's own already-fetched analysis (see aiInsightService.ts), never
// a hardcoded/demo response.
export const AiFinancialInsight: React.FC<AiFinancialInsightProps> = ({ health, questionnaireAnswers }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [insight, setInsight] = useState<AiInsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const runInsight = useCallback(() => {
    setStatus('loading');
    setError(null);
    generateAiInsight({
      financialSummary: health.summary,
      financialIndicators: health.indicators,
      financialPatterns: health.patterns,
      financialTrend: health.charts.monthly_summary,
      questionnaireAnswers: Object.keys(questionnaireAnswers).length > 0 ? questionnaireAnswers : undefined,
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
        setError(err instanceof Error ? err.message : t('aiFinancialInsight.errorGeneric'));
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [health, questionnaireAnswers]);

  // Guarded by a ref (not just an empty dep array) so React StrictMode's
  // dev-only double-invoke never fires two Gemini requests for one mount.
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    runInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDECE8] pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] font-extrabold uppercase tracking-wider text-indigo-700 block">
              {t('aiFinancialInsight.badge')}
            </span>
            <p className="text-[12px] text-slate-500">{t('aiFinancialInsight.poweredBy')}</p>
          </div>
        </div>

        {status === 'success' && (
          <button
            onClick={runInsight}
            title={t('aiFinancialInsight.refresh')}
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
            <span className="text-xs font-bold">{t('aiFinancialInsight.loading')}</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-2xl bg-stone-100 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="h-14 rounded-2xl bg-stone-100 animate-pulse"></div>
              <div className="h-14 rounded-2xl bg-stone-100 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-xl bg-stone-100 animate-pulse"></div>
              <div className="h-10 rounded-xl bg-stone-100 animate-pulse"></div>
            </div>
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
            <span>{t('aiFinancialInsight.retry')}</span>
          </button>
        </div>
      )}

      {status === 'insufficient' && (
        <div className="py-6 text-center space-y-2 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-slate-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t('aiFinancialInsight.insufficientData')}
          </p>
        </div>
      )}

      {status === 'success' && insight && (
        <div className="space-y-4 animate-fade-in">
          {/* Key finding — highlighted */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs border border-indigo-100">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 block mb-0.5">
                {t('aiFinancialInsight.keyFinding')}
              </span>
              <p className="text-sm font-bold text-indigo-950 leading-snug">{insight.keyFinding}</p>
            </div>
          </div>

          {/* What the data suggests + pattern explanation */}
          <div className={`grid grid-cols-1 gap-3 ${insight.patternExplanation ? 'sm:grid-cols-2' : ''}`}>
            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {t('aiFinancialInsight.whatDataSuggests')}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{insight.whatDataSuggests}</p>
            </div>
            {insight.patternExplanation && (
              <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-indigo-500" />
                  <span>{t('aiFinancialInsight.patternExplanation')}</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{insight.patternExplanation}</p>
              </div>
            )}
          </div>

          {/* Next steps */}
          {insight.nextSteps.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#EDECE8]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {t('aiFinancialInsight.nextSteps')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {insight.nextSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-2 p-3 bg-white border border-[#EDECE8] rounded-xl hover:border-indigo-200 hover:shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 font-medium leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas to review */}
          {insight.areasToReview.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#EDECE8]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <Eye className="w-3 h-3 text-amber-600" />
                <span>{t('aiFinancialInsight.areasToReview')}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {insight.areasToReview.map((area, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-900 text-xs font-semibold rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 italic pt-1">{t('aiFinancialInsight.disclaimer')}</p>
        </div>
      )}
    </div>
  );
};

export default AiFinancialInsight;
