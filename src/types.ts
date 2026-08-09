export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'informational';

export type PatternCategory =
  | 'account_access'
  | 'spending_control'
  | 'documentation'
  | 'transaction_anomaly'
  | 'credit_and_debt';

export interface FinancialPattern {
  id: string;
  category: PatternCategory;
  title: string;
  description: string;
  severity: RiskLevel;
  dateDetected?: string;
  evidenceCount?: number;
  reflectionQuestions: string[];
  recommendedActions: string[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountName: string;
  isJoint: boolean;
  flagged?: boolean;
  flagReason?: string;
  userNote?: string;
}

export interface AssessmentAnswer {
  questionId: string;
  value: string | number;
  notes?: string;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    helperText?: string;
    options: {
      value: string;
      label: string;
      description?: string;
      vulnerabilityWeight?: number; // 0 (low) to 3 (high)
    }[];
  }[];
}

export interface UserSettings {
  discreetMode: boolean;
  quickExitUrl: string;
  autoClearOnExit: boolean;
  pinProtected: boolean;
  pinCode?: string;
  analyticsOptOut: boolean;
  themeStyle: 'default' | 'expense_tracker' | 'document_reader';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'warning' | 'info' | 'danger';
}

// Backend /api/analyze contract (see backend/src/types.ts)
export type AnalysisSeverity = 'none' | 'low' | 'medium' | 'high';

export type AnalysisSignalKey =
  | 'income_control'
  | 'financial_decision_control'
  | 'forced_transfers'
  | 'debt_pressure'
  | 'financial_surveillance'
  | 'economic_dependence';

export interface AnalysisSignal {
  detected: boolean;
  severity: AnalysisSeverity;
  evidence: string;
}

export type AnalysisSignals = Record<AnalysisSignalKey, AnalysisSignal>;

export type AnalysisRiskLevel = 'low' | 'moderate' | 'elevated' | 'high';

export interface AnalysisRisk {
  rawScore: number;
  maxScore: number;
  normalizedScore: number;
  level: AnalysisRiskLevel;
}

export interface Analysis {
  signals: AnalysisSignals;
  risk: AnalysisRisk;
}

export interface AnalyzeSuccessResponse {
  success: true;
  analysis: Analysis;
}

export interface AnalyzeErrorResponse {
  success: false;
  error: string;
}

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

// Supabase `assessments` row (see supabase/schema.sql)
export interface Assessment {
  id: string;
  userId: string;
  answers: Record<string, string>;
  analysis: Analysis;
  createdAt: string;
}
