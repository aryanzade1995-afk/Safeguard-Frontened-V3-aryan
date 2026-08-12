import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  TrendingDown,
  Repeat,
  Info,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSafeguard } from '../context/SafeguardContext';
import { useTranslation } from '../hooks/useTranslation';
import { AiFinancialInsight } from '../components/common/AiFinancialInsight';
import { BackButton } from '../components/common/BackButton';
import { getFinancialHealth } from '../services/financialHealthService';
import { FinancialHealthData, MonthlySpendingPoint } from '../types';

// Maps a set of real chart points onto the existing 500x150 line-chart
// viewBox — pure coordinate/rendering math, not a financial calculation.
function buildLineChartGeometry(points: MonthlySpendingPoint[]) {
  const amounts = points.map((p) => p.amount);
  const min = Math.min(...amounts, 0);
  const max = Math.max(...amounts, 1);
  const range = max - min || 1;
  const n = points.length;

  const coords = points.map((p, i) => {
    const x = n <= 1 ? 250 : (i / (n - 1)) * 500;
    const y = 140 - ((p.amount - min) / range) * 130;
    return { x, y, point: p };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const polygonPoints =
    coords.length > 0
      ? `0,150 ${polylinePoints} ${coords[coords.length - 1].x},150`
      : '';

  return { coords, polylinePoints, polygonPoints };
}

export const PatternAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, questionnaireAnswers } = useSafeguard();
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; amount: number } | null>(null);

  const CONFIDENCE_BADGE = (confidence: number) => {
    if (confidence >= 0.9) {
      return { label: t('patternAnalysis.confidenceHigh'), className: 'px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-100' };
    }
    if (confidence >= 0.7) {
      return { label: t('patternAnalysis.confidenceModerate'), className: 'px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100' };
    }
    return { label: t('patternAnalysis.confidenceLow'), className: 'px-3 py-1 bg-stone-100 text-slate-600 text-xs font-bold rounded-full border border-stone-200' };
  };

  const INDICATOR_STATUS_LABEL: Record<string, string> = {
    observed: t('patternAnalysis.indicatorObserved'),
    none_observed: t('patternAnalysis.indicatorNone'),
  };

  const [health, setHealth] = useState<FinancialHealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    getFinancialHealth(user.id)
      .then((data) => {
        if (isMounted) setHealth(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : t('patternAnalysis.errorTitle'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleContinue = () => {
    addToast({
      title: t('patternAnalysis.toast.continueTitle'),
      description: t('patternAnalysis.toast.continueDesc'),
      type: 'info',
    });
    navigate('/questionnaire');
  };

  const formatCurrency = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const formatPercent = (n: number | null) => (n === null || n === undefined ? '—' : `${n}%`);

  // LOADING STATE
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">{t('patternAnalysis.loading')}</p>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('patternAnalysis.errorTitle')}</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/financial-data')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
        >
          {t('patternAnalysis.backToFinancialData')}
        </button>
      </div>
    );
  }

  // EMPTY STATE — no saved financial analysis yet
  if (!health) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-4 sm:py-6">
        <BackButton fallbackPath="/dashboard" forceFallback />
        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 sm:p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('patternAnalysis.emptyTitle')}</h2>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
            {t('patternAnalysis.emptyDesc')}
          </p>
          <button
            onClick={() => navigate('/financial-data')}
            className="inline-flex items-center space-x-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>{t('patternAnalysis.goToFinancialData')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const { summary, indicators, charts, patterns, disclaimer } = health;
  const { coords: linePoints, polylinePoints, polygonPoints } = buildLineChartGeometry(charts.monthly_spending);
  const withdrawalMax = Math.max(...charts.cash_withdrawals.map((p) => p.amount), 1);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-4 sm:py-6">
      <BackButton fallbackPath="/dashboard" forceFallback />
      {/* HEADER */}
      <div className="space-y-3 border-b border-[#EDECE8] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('patternAnalysis.badge')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-stone-100 text-slate-700 border border-stone-200 rounded-full text-xs font-bold uppercase tracking-wider">
              {t('patternAnalysis.informationalAnalysis')}
            </span>
            <button
              onClick={() => navigate('/financial-data')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200 transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{t('patternAnalysis.changeStatement')}</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
          {t('patternAnalysis.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl leading-relaxed">
          {t('patternAnalysis.subtitle')}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-1">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
            {t('dashboard.monthlySpending')}
          </span>
          <div className="text-2xl font-extrabold text-[#1A1A1A]">{formatCurrency(summary.monthly_spending)}</div>
          <span className="text-[11px] text-slate-400">
            {summary.spending_trend_status === 'insufficient_data'
              ? t('patternAnalysis.notEnoughHistory')
              : `${
                  summary.spending_trend_status === 'increasing'
                    ? t('patternAnalysis.trendUp')
                    : summary.spending_trend_status === 'decreasing'
                      ? t('patternAnalysis.trendDown')
                      : t('patternAnalysis.trendStable')
                }${
                  summary.spending_change_percent !== null && summary.spending_change_percent !== undefined
                    ? ` (${summary.spending_change_percent > 0 ? '+' : ''}${summary.spending_change_percent}%)`
                    : ''
                }`}
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-1">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
            {t('patternAnalysis.monthlyIncome')}
          </span>
          <div className="text-2xl font-extrabold text-indigo-600">{formatCurrency(summary.monthly_income)}</div>
          <span className="text-[11px] text-slate-400">
            {summary.cash_flow_status === 'positive' && t('patternAnalysis.positiveCashFlow')}
            {summary.cash_flow_status === 'break_even' && t('patternAnalysis.breakEven')}
            {summary.cash_flow_status === 'spending_exceeds_income' && t('patternAnalysis.spendingExceeds')}
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-1">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
            {t('patternAnalysis.averageMonthlySpending')}
          </span>
          <div className="text-2xl font-extrabold text-[#1A1A1A]">{formatCurrency(summary.average_monthly_spending)}</div>
          <span className="text-[11px] text-slate-400">
            {formatPercent(summary.spending_utilization_percent)} {t('patternAnalysis.incomeUtilization')}
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-1">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
            {t('dashboard.patternsIdentified')}
          </span>
          <div className="text-2xl font-extrabold text-amber-600">{patterns.length}</div>
          <span className="text-[11px] text-slate-400">{t('patternAnalysis.signalsForReflection')}</span>
        </div>
      </div>

      {/* SALARY -> WITHDRAWAL -> TRANSFER TIMELINE (purely illustrative, unchanged) */}
      <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 sm:p-6 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-4">
          {t('patternAnalysis.typicalFlow')}
        </span>
        <div className="flex items-center">
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('patternAnalysis.salary')}</span>
            <span className="text-[11px] text-slate-400">{t('patternAnalysis.depositReceived')}</span>
          </div>

          <div className="flex-1 h-px bg-stone-200 relative -mt-8">
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 absolute right-0 -top-1.5" />
          </div>

          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('patternAnalysis.withdrawal')}</span>
            <span className="text-[11px] text-slate-400">{t('patternAnalysis.cashOutflow')}</span>
          </div>

          <div className="flex-1 h-px bg-stone-200 relative -mt-8">
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 absolute right-0 -top-1.5" />
          </div>

          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('patternAnalysis.transfer')}</span>
            <span className="text-[11px] text-slate-400">{t('patternAnalysis.recurringOutflow')}</span>
          </div>
        </div>
      </div>

      {/* SPENDING TREND LINE CHART */}
      <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#EDECE8] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">{t('patternAnalysis.spendingTrendTitle')}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {t('patternAnalysis.spendingTrendDesc')}
            </p>
          </div>
          {hoveredPoint && (
            <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 animate-fade-in">
              {hoveredPoint.month}: {formatCurrency(hoveredPoint.amount)}
            </div>
          )}
        </div>

        {charts.monthly_spending.length === 0 ? (
          <p className="text-sm text-slate-500">{t('patternAnalysis.notEnoughMonthly')}</p>
        ) : (
          <div className="relative pt-6 pb-2">
            <div className="h-44 w-full flex items-end justify-between gap-2 relative">
              {/* Background horizontal gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-300 w-full"></div>
                <div className="border-b border-slate-300 w-full"></div>
                <div className="border-b border-slate-300 w-full"></div>
              </div>

              {/* SVG Line & Points */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points={polygonPoints} fill="url(#spendingGrad)" />
                <polyline
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              </svg>

              {/* Interactive Circles / Data Points */}
              {linePoints.map((c) => (
                <div
                  key={c.point.month_key}
                  onMouseEnter={() => setHoveredPoint({ month: c.point.month, amount: c.point.amount })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer"
                >
                  <div className="relative flex flex-col items-center mb-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-md mb-1 whitespace-nowrap shadow-md pointer-events-none">
                      {formatCurrency(c.point.amount)}
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-125 group-hover:bg-indigo-600 transition-all shadow-xs"></div>
                  </div>
                  <span className="text-[12px] font-medium text-slate-500 mt-2">{c.point.month.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WITHDRAWAL PATTERN & TRANSFER PATTERN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WITHDRAWAL PATTERN VISUALIZATION */}
        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{t('patternAnalysis.cashWithdrawalPattern')}</h3>
              <span className="text-[11px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {INDICATOR_STATUS_LABEL[indicators.cash_withdrawals.status]}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              {t('patternAnalysis.withdrawalCount', { count: String(indicators.cash_withdrawals.count), plural: indicators.cash_withdrawals.count === 1 ? '' : 's' })} · {formatCurrency(indicators.cash_withdrawals.total)} {t('patternAnalysis.total')} · {formatPercent(indicators.cash_withdrawals.income_share_percent)} {t('patternAnalysis.ofIncome')}
            </p>
          </div>

          {/* Bar chart representation */}
          {charts.cash_withdrawals.length === 0 ? (
            <p className="text-xs text-slate-400 pt-2">{t('patternAnalysis.noWithdrawals')}</p>
          ) : (
            <div className="space-y-2 pt-2">
              {charts.cash_withdrawals.map((d) => {
                const pct = Math.min(100, Math.round((d.amount / withdrawalMax) * 100));
                return (
                  <div key={d.month_key} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-600 font-medium">{d.month}</span>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(d.amount)}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-indigo-400"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[12px] text-[#9CA3AF] italic pt-2 border-t border-[#EDECE8]">
            {t('patternAnalysis.withdrawalNote')}
          </p>
        </div>

        {/* TRANSFER PATTERN CARD */}
        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Repeat className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('patternAnalysis.recurringTransfersTitle')}</h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {t('patternAnalysis.fixedOutflow')}
              </span>
            </div>

            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EDECE8] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">{t('patternAnalysis.identifiedTransfer')}</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatCurrency(indicators.recurring_transfers.total)} {t('patternAnalysis.recurringTransfer')}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-100">
                  {t('patternAnalysis.detectedTimes', { count: String(indicators.recurring_transfers.count) })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#EDECE8]">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">{t('patternAnalysis.status')}</span>
                  <span className="font-semibold text-slate-700">
                    {INDICATOR_STATUS_LABEL[indicators.recurring_transfers.status]}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">{t('patternAnalysis.incomeShare')}</span>
                  <span className="font-semibold text-slate-700">
                    {formatPercent(indicators.recurring_transfers.income_share_percent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
            {t('patternAnalysis.transferNote')}
          </div>
        </div>
      </div>

      {/* AI FINANCIAL INSIGHTS — real Gemini-generated analysis, grounded in
          this exact `health` payload (never demo/hardcoded content) */}
      <AiFinancialInsight health={health} questionnaireAnswers={questionnaireAnswers} />

      {/* IDENTIFIED PATTERN DETAILS — driven entirely by backend patterns */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#1A1A1A]">{t('patternAnalysis.identifiedPatternDetails')}</h3>

        {patterns.length === 0 ? (
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs">
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('patternAnalysis.noPatterns')}
            </p>
          </div>
        ) : (
          patterns.map((pattern, index) => {
            const badge = CONFIDENCE_BADGE(pattern.confidence);
            return (
              <div
                key={`${pattern.type}-${index}`}
                className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDECE8] pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600">
                      {`Pattern ${String(index + 1).padStart(2, '0')}`}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">{pattern.title}</h4>
                  </div>
                  <span className={badge.className}>{badge.label}</span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('patternAnalysis.observedPattern')}</h5>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed bg-[#FAF9F6] p-4 rounded-xl border border-[#EDECE8]">
                    {pattern.description}
                  </p>
                </div>

                {/* Visually emphasized safety disclaimer — exact backend wording, never altered */}
                <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>{t('patternAnalysis.whatThisCannotTellUs')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">{disclaimer}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI EXPLANATION SECTION */}
      <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold text-[#1A1A1A]">{t('patternAnalysis.howInterprets')}</h4>
        </div>

        <p className="text-sm text-[#6B7280] leading-relaxed pl-9">
          {t('patternAnalysis.interpretsDesc')}
        </p>
      </div>

      {/* BOTTOM NAVIGATION ACTIONS */}
      <div className="pt-6 border-t border-[#EDECE8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('patternAnalysis.back')}</span>
        </button>

        <button
          onClick={handleContinue}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>{t('patternAnalysis.continueToQuestions')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PatternAnalysis;
