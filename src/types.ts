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

// POST /api/assessment request/response contract (backend/src/index.ts).
// Deliberately decoupled from the raw `Analysis` shape at this network
// boundary — a future model change only ever needs to touch `Analysis`
// itself (or nothing at all); this envelope stays stable.
export interface AssessmentSubmissionRequest {
  statement: string;
  answers: Record<string, string>;
}

export interface AssessmentSubmissionSuccessResponse {
  success: true;
  assessment: Assessment;
}

export interface AssessmentSubmissionErrorResponse {
  success: false;
  error: string;
}

export type AssessmentSubmissionResponse =
  | AssessmentSubmissionSuccessResponse
  | AssessmentSubmissionErrorResponse;

// GET /api/financial/health contract (FastAPI backend, see
// ../qwen4b/backend/main.py). Field names mirror the backend response
// exactly — this page never recomputes financial figures on the frontend.
export type CashFlowStatus = 'positive' | 'break_even' | 'spending_exceeds_income';
export type SpendingTrendStatus = 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
export type IndicatorStatus = 'observed' | 'none_observed';

export interface FinancialHealthSummary {
  monthly_income: number;
  monthly_spending: number;
  average_monthly_spending: number;
  spending_utilization_percent: number | null;
  cash_flow_status: CashFlowStatus;
  spending_trend_status: SpendingTrendStatus;
  spending_change_percent: number | null;
}

export interface FinancialHealthIndicator {
  count: number;
  total: number;
  income_share_percent: number | null;
  status: IndicatorStatus;
}

export interface FinancialHealthIndicators {
  cash_withdrawals: FinancialHealthIndicator;
  recurring_transfers: FinancialHealthIndicator;
}

export interface MonthlySpendingPoint {
  month: string;
  amount: number;
  income: number;
  month_key: string;
}

export interface CashWithdrawalPoint {
  month: string;
  amount: number;
  month_key: string;
}

export interface TransferPoint {
  month: string;
  amount: number;
  count: number;
  month_key: string;
}

export interface MonthlySummaryPoint {
  month: string;
  income: number;
  spending: number;
  utilization_percent: number;
  month_key: string;
}

export interface FinancialHealthCharts {
  monthly_spending: MonthlySpendingPoint[];
  cash_withdrawals: CashWithdrawalPoint[];
  transfers: TransferPoint[];
  monthly_summary: MonthlySummaryPoint[];
}

export interface FinancialPatternItem {
  type: string;
  title: string;
  confidence: number;
  description: string;
}

export interface FinancialHealthData {
  filename: string | null;
  created_at: string | null;
  date_range: { start: string; end: string } | null;
  summary: FinancialHealthSummary;
  indicators: FinancialHealthIndicators;
  charts: FinancialHealthCharts;
  patterns: FinancialPatternItem[];
  disclaimer: string;
}

export interface FinancialHealthResponse {
  status: 'success';
  found: boolean;
  data: FinancialHealthData | null;
}

// POST /api/financial/analyze success response (multipart upload).
// financial_analysis_id/created_at come straight from the saved Supabase
// row — never generated or guessed on the frontend.
export interface FinancialAnalyzeSuccessResponse {
  status: 'success';
  filename: string;
  financial_analysis_id: string;
  created_at: string;
}
