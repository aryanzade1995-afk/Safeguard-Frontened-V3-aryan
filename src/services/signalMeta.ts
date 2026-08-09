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

interface SignalMeta {
  title: string;
  context: string;
  recommendation: string;
}

// Static, non-personalized copy per category — describes what the category
// means and offers a neutral next step. The per-assessment "Observation"
// text always comes from the real evidence returned by the backend.
export const SIGNAL_META: Record<AnalysisSignalKey, SignalMeta> = {
  income_control: {
    title: 'Income control',
    context: 'Consistent, direct access to your own income supports day-to-day independence and financial confidence.',
    recommendation: 'Consider whether you have ongoing, unrestricted access to the income you earn.',
  },
  financial_decision_control: {
    title: 'Financial decision-making',
    context: 'Equal partnerships foster shared decision-making without unilateral pressure.',
    recommendation: 'Reflect on choices where you would prefer greater individual autonomy.',
  },
  forced_transfers: {
    title: 'Pressured money transfers',
    context: 'Voluntary, mutually agreed transfers look different from money given under pressure or obligation.',
    recommendation: 'Consider whether recent transfers were made freely and without pressure.',
  },
  debt_pressure: {
    title: 'Debt-related pressure',
    context: 'Debt taken on without full knowledge or consent can affect your financial standing and independence.',
    recommendation: "Review any accounts or debts opened in your name to confirm you're aware of them.",
  },
  financial_surveillance: {
    title: 'Financial surveillance',
    context: 'Monitoring of spending or accounts without consent can reduce a sense of financial privacy and autonomy.',
    recommendation: "Consider whether your financial activity is monitored in ways you haven't agreed to.",
  },
  economic_dependence: {
    title: 'Economic dependence',
    context: 'Having some independent financial footing — savings, income, or credit in your own name — supports long-term autonomy.',
    recommendation: 'Explore small steps toward independent savings or income, where possible.',
  },
};

interface SeverityBadge {
  label: string;
  className: string;
}

// Reuses the exact badge classes already present in the existing breakdown
// cards (amber / indigo / stone variants) — only the copy is data-driven.
export const SEVERITY_BADGE: Record<AnalysisSeverity, SeverityBadge> = {
  high: {
    label: 'High severity',
    className: 'px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full',
  },
  medium: {
    label: 'Medium severity',
    className: 'px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full',
  },
  low: {
    label: 'Low severity',
    className: 'px-2.5 py-0.5 bg-stone-100 text-slate-700 text-[11px] font-bold rounded-full',
  },
  none: {
    label: 'Low severity',
    className: 'px-2.5 py-0.5 bg-stone-100 text-slate-700 text-[11px] font-bold rounded-full',
  },
};
