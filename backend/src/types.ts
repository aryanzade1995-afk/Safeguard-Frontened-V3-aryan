export type Severity = 'none' | 'low' | 'medium' | 'high';

export type SignalKey =
  | 'income_control'
  | 'financial_decision_control'
  | 'forced_transfers'
  | 'debt_pressure'
  | 'financial_surveillance'
  | 'economic_dependence';

export interface Signal {
  detected: boolean;
  severity: Severity;
  evidence: string;
}

export type Signals = Record<SignalKey, Signal>;

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high';

export interface Risk {
  rawScore: number;
  maxScore: number;
  normalizedScore: number;
  level: RiskLevel;
}

export interface Analysis {
  signals: Signals;
  risk: Risk;
}

export interface AnalyzeResponse {
  success: true;
  analysis: Analysis;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export const SIGNAL_KEYS: SignalKey[] = [
  'income_control',
  'financial_decision_control',
  'forced_transfers',
  'debt_pressure',
  'financial_surveillance',
  'economic_dependence',
];
