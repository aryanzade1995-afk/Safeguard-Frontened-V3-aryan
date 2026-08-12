import { AnalysisSeverity, AnalysisSignalKey } from '../types';

// Canonical display order, matching the backend's SIGNAL_KEYS.
export const SIGNAL_ORDER: AnalysisSignalKey[] = [
  'income_control',
  'financial_decision_control',
  'forced_transfers',
  'debt_pressure',
  'financial_surveillance',
  'economic_dependence',
];

// Title/context/recommendation copy per category now lives in
// src/i18n/translations.ts under `signalMeta.<key>` so it can be translated —
// callers should use useTranslation()'s t(`signalMeta.${key}.title`) etc.
// instead of a static lookup here.

// Reuses the exact badge classes already present in the existing breakdown
// cards (clay / forest / linen variants) — only the label text is
// translated (see `signalMeta.severity.<level>` in translations.ts).
export const SEVERITY_BADGE_CLASS: Record<AnalysisSeverity, string> = {
  high: 'px-2.5 py-0.5 bg-amber-50 text-amber-900 text-[12px] font-bold rounded-full',
  medium: 'px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[12px] font-bold rounded-full',
  low: 'px-2.5 py-0.5 bg-stone-100 text-slate-600 text-[12px] font-bold rounded-full',
  none: 'px-2.5 py-0.5 bg-stone-100 text-slate-600 text-[12px] font-bold rounded-full',
};
