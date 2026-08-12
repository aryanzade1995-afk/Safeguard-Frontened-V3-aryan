import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gauge,
  History,
  Compass,
  Flag,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Scale,
  ArrowRightLeft,
  Eye,
  Link2,
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Tooltip } from '../ui/Tooltip';
import { RadialProgress } from '../ui/Progress';
import { SIGNAL_ORDER, SEVERITY_BADGE_CLASS } from '../../services/signalMeta';
import { Assessment, AnalysisSeverity, AnalysisSignal, AnalysisSignalKey } from '../../types';

export interface FinancialWellbeingCardProps {
  // Most-recent-first, real saved assessments only (never demo/mock rows) —
  // guaranteed non-empty by the caller (Dashboard only mounts this once at
  // least one real assessment exists).
  assessments: Assessment[];
}

const SEVERITY_SEGMENT_CLASS: Record<AnalysisSeverity, string> = {
  none: 'bg-stone-200',
  low: 'bg-stone-400',
  medium: 'bg-indigo-500',
  high: 'bg-amber-500',
};

const SEVERITY_RANK: Record<AnalysisSeverity, number> = { none: 0, low: 1, medium: 2, high: 3 };

const SIGNAL_ICON: Record<AnalysisSignalKey, React.ComponentType<{ className?: string }>> = {
  income_control: Wallet,
  financial_decision_control: Scale,
  forced_transfers: ArrowRightLeft,
  debt_pressure: AlertTriangle,
  financial_surveillance: Eye,
  economic_dependence: Link2,
};

// Defensive fallbacks for assessment rows that predate the current
// signals/risk shape (or otherwise have a gap in stored data) — indexing a
// missing signal or reading a missing risk field must degrade gracefully,
// never throw and blank the whole dashboard.
const FALLBACK_SIGNAL: AnalysisSignal = { detected: false, severity: 'none', evidence: '' };

const getSignal = (a: Assessment, key: AnalysisSignalKey): AnalysisSignal => a.analysis?.signals?.[key] ?? FALLBACK_SIGNAL;

const autonomyIndexOf = (a: Assessment) => {
  const normalizedScore = a.analysis?.risk?.normalizedScore ?? 0;
  return Math.round((1 - normalizedScore) * 100);
};

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function buildScoreLineGeometry(points: { date: string; value: number }[]) {
  const n = points.length;
  const coords = points.map((p, i) => {
    const x = n <= 1 ? 250 : (i / (n - 1)) * 500;
    const y = 140 - (Math.min(100, Math.max(0, p.value)) / 100) * 130;
    return { x, y, point: p };
  });
  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const polygonPoints = coords.length > 0 ? `0,150 ${polylinePoints} ${coords[coords.length - 1].x},150` : '';
  return { coords, polylinePoints, polygonPoints };
}

const SectionEyebrow: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string }> = ({
  icon: Icon,
  label,
}) => (
  <div className="flex items-center space-x-2">
    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{label}</span>
  </div>
);

const StatTile: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-xl p-3 space-y-1">
    <Icon className="w-3.5 h-3.5 text-indigo-500" />
    <div className="text-sm font-extrabold text-slate-900 leading-tight">{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">{label}</div>
  </div>
);

const EmptyState: React.FC<{ icon: React.ComponentType<{ className?: string }>; text: string; positive?: boolean }> = ({
  icon: Icon,
  text,
  positive,
}) => (
  <div className="py-8 text-center space-y-2.5">
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center mx-auto ${
        positive ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-slate-400'
      }`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{text}</p>
  </div>
);

export const FinancialWellbeingCard: React.FC<FinancialWellbeingCardProps> = ({ assessments }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; value: number } | null>(null);

  const VULNERABILITY_LABEL: Record<'low' | 'moderate' | 'elevated' | 'high', string> = {
    low: t('dashboard.vulnerability.low'),
    moderate: t('dashboard.vulnerability.moderate'),
    elevated: t('dashboard.vulnerability.elevated'),
    high: t('dashboard.vulnerability.high'),
  };

  const latestAssessment = assessments[0];
  const previousAssessment = assessments[1] || null;
  const latestIndex = autonomyIndexOf(latestAssessment);
  const tierLabel = VULNERABILITY_LABEL[latestAssessment.analysis?.risk?.level ?? 'low'];

  const signalEntries = SIGNAL_ORDER.map((key) => [key, getSignal(latestAssessment, key)] as const);
  const detectedSignals = signalEntries.filter(([, s]) => s.detected);

  // WHAT CHANGED — every real saved assessment, oldest first, never a
  // fabricated series.
  const chronological = [...assessments].reverse();
  const trendPoints = chronological.map((a) => ({ date: a.createdAt, value: autonomyIndexOf(a) }));
  const { coords: linePoints, polylinePoints, polygonPoints } = buildScoreLineGeometry(trendPoints);

  const scoreDelta = previousAssessment ? latestIndex - autonomyIndexOf(previousAssessment) : null;
  const DeltaIcon = scoreDelta === null || scoreDelta === 0 ? Minus : scoreDelta > 0 ? TrendingUp : TrendingDown;
  const deltaBadgeClass =
    scoreDelta === null || scoreDelta === 0
      ? 'bg-stone-100 text-slate-500 border border-stone-200'
      : scoreDelta > 0
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-rose-50 text-rose-700 border border-rose-200';
  const deltaLabel =
    scoreDelta === null ? '' : scoreDelta === 0 ? t('dashboard.noChange') : `${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts`;

  const newSignals = previousAssessment
    ? SIGNAL_ORDER.filter(
        (key) => getSignal(latestAssessment, key).detected && !getSignal(previousAssessment, key).detected
      )
    : [];
  const resolvedSignals = previousAssessment
    ? SIGNAL_ORDER.filter(
        (key) => getSignal(previousAssessment, key).detected && !getSignal(latestAssessment, key).detected
      )
    : [];

  // WHAT CAN I DO — real detected signals only, most severe first. Never a
  // generic fallback list.
  const actionItems = [...detectedSignals].sort(
    ([, a], [, b]) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  );

  return (
    <div className="bg-white border border-[#EDECE8] rounded-[28px] shadow-xs relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />

      {/* SECTION 1 — WHERE AM I? */}
      <div className="p-6 sm:p-10 space-y-6">
        <SectionEyebrow icon={Gauge} label={t('financialWellbeing.whereAmI')} />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <RadialProgress
            value={latestIndex}
            size={140}
            strokeWidth={12}
            variant="indigo"
            sublabel={t('dashboard.financialAutonomy')}
          />

          <div className="flex-1 w-full space-y-5">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 block">
                {t('dashboard.financialAutonomy')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{tierLabel}</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl">{t('dashboard.autonomyDesc')}</p>
            </div>

            {/* Segmented signal indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>{t('financialWellbeing.signalBreakdown')}</span>
                <span>
                  {t('financialWellbeing.flaggedCount', {
                    count: String(detectedSignals.length),
                    total: String(SIGNAL_ORDER.length),
                  })}
                </span>
              </div>
              <div className="flex gap-1">
                {signalEntries.map(([key, s]) => (
                  <Tooltip
                    key={key}
                    content={
                      <span>
                        {t(`signalMeta.${key}.title`)} —{' '}
                        {s.detected ? t(`signalMeta.severity.${s.severity}`) : t('financialWellbeing.notFlagged')}
                      </span>
                    }
                  >
                    <div
                      className={`h-2.5 flex-1 rounded-full cursor-pointer transition-transform hover:scale-y-125 ${
                        SEVERITY_SEGMENT_CLASS[s.detected ? s.severity : 'none']
                      }`}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Supporting stat tiles */}
            <div className="grid grid-cols-3 gap-2">
              <StatTile
                icon={Flag}
                label={t('financialWellbeing.signalsFlagged')}
                value={`${detectedSignals.length}/${SIGNAL_ORDER.length}`}
              />
              <StatTile icon={Shield} label={t('financialWellbeing.riskTier')} value={tierLabel} />
              <StatTile
                icon={Clock}
                label={t('financialWellbeing.lastAssessed')}
                value={formatShortDate(latestAssessment.createdAt)}
              />
            </div>

            <button
              onClick={() => navigate('/results')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>{t('dashboard.viewFullResults')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2 — WHAT HAS CHANGED? */}
      <div id="what-changed" className="p-6 sm:p-10 border-t border-[#EDECE8] space-y-5 scroll-mt-24">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionEyebrow icon={History} label={t('financialWellbeing.whatChanged')} />
          {scoreDelta !== null && (
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${deltaBadgeClass}`}
            >
              <DeltaIcon className="w-3.5 h-3.5" />
              <span>{deltaLabel}</span>
            </span>
          )}
        </div>

        {assessments.length < 2 ? (
          <EmptyState icon={History} text={t('financialWellbeing.notEnoughHistory')} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-end h-5">
              {hoveredPoint && (
                <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 animate-fade-in">
                  {formatFullDate(hoveredPoint.date)}: {hoveredPoint.value}/100
                </div>
              )}
            </div>

            <div className="relative pt-6 pb-2">
              <div className="h-44 w-full flex items-end justify-between gap-2 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-300 w-full"></div>
                  <div className="border-b border-slate-300 w-full"></div>
                  <div className="border-b border-slate-300 w-full"></div>
                </div>

                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="wellbeingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon points={polygonPoints} fill="url(#wellbeingGrad)" />
                  <polyline
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                </svg>

                {linePoints.map((c, i) => {
                  const isLatest = i === linePoints.length - 1;
                  return (
                    <div
                      key={c.point.date}
                      onMouseEnter={() => setHoveredPoint({ date: c.point.date, value: c.point.value })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer"
                    >
                      <div className="relative flex flex-col items-center mb-2">
                        {isLatest && (
                          <span className="mb-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wide shadow-xs whitespace-nowrap">
                            {t('financialWellbeing.latest')}
                          </span>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-md mb-1 whitespace-nowrap shadow-md pointer-events-none">
                          {c.point.value}/100
                        </div>
                        <div
                          className={`rounded-full border-2 transition-all shadow-xs ${
                            isLatest
                              ? 'w-4 h-4 bg-indigo-600 border-indigo-600'
                              : 'w-3.5 h-3.5 bg-white border-indigo-600 group-hover:scale-125 group-hover:bg-indigo-600'
                          }`}
                        ></div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 mt-2">
                        {formatShortDate(c.point.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(newSignals.length > 0 || resolvedSignals.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-100">
                {newSignals.map((key) => (
                  <span
                    key={key}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold rounded-full"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t(`signalMeta.${key}.title`)}</span>
                  </span>
                ))}
                {resolvedSignals.map((key) => (
                  <span
                    key={key}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-full"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t(`signalMeta.${key}.title`)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3 — WHAT CAN I DO? */}
      <div className="p-6 sm:p-10 border-t border-[#EDECE8] space-y-5">
        <SectionEyebrow icon={Compass} label={t('financialWellbeing.whatCanIDo')} />

        {actionItems.length === 0 ? (
          <EmptyState icon={CheckCircle2} text={t('financialWellbeing.noActionItems')} positive />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionItems.map(([key, s]) => {
              const Icon = SIGNAL_ICON[key];
              const severityKey = s.severity === 'none' ? 'low' : s.severity;
              const rank = SEVERITY_RANK[s.severity];
              return (
                <div
                  key={key}
                  className="p-4 bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl space-y-2.5 hover:border-indigo-200 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={SEVERITY_BADGE_CLASS[s.severity]}>{t(`signalMeta.severity.${severityKey}`)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{t(`signalMeta.${key}.title`)}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{t(`signalMeta.${key}.recommendation`)}</p>
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full ${
                          n <= rank ? SEVERITY_SEGMENT_CLASS[s.severity] : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialWellbeingCard;
