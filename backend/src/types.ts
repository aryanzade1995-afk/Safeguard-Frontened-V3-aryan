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

export interface AssessmentRecord {
  id: string;
  userId: string;
  answers: Record<string, string>;
  analysis: Analysis;
  createdAt: string;
}

export interface AssessmentSuccessResponse {
  success: true;
  assessment: AssessmentRecord;
}

export type AssessmentResponse = AssessmentSuccessResponse | ErrorResponse;

export const SIGNAL_KEYS: SignalKey[] = [
  'income_control',
  'financial_decision_control',
  'forced_transfers',
  'debt_pressure',
  'financial_surveillance',
  'economic_dependence',
];

// POST /api/ai-insight contract. The financial fields are forwarded to
// Gemini verbatim (JSON.stringify'd into the prompt) — the backend only
// reads the few fields below that it needs for the hasEnoughInsightData
// gate, so these stay intentionally loose rather than mirroring the FastAPI
// backend's full FinancialHealthData shape field-for-field.
export interface AiInsightIndicatorStatus {
  status: string;
  [key: string]: unknown;
}

export interface AiInsightFinancialSummary {
  spending_trend_status: string;
  [key: string]: unknown;
}

export interface AiInsightIndicators {
  cash_withdrawals: AiInsightIndicatorStatus;
  recurring_transfers: AiInsightIndicatorStatus;
}

// All fields are optional so this single endpoint can serve both callers:
// the Financial Pattern Overview page (financial* fields, from the FastAPI
// bank-statement backend) and the Financial Autonomy Report page (signals/
// risk, from this backend's own assessment pipeline) — whichever real data
// a page actually has, forwarded as-is, never both fabricated to fit one
// shape.
export interface AiInsightRequestBody {
  financialSummary?: AiInsightFinancialSummary;
  financialIndicators?: AiInsightIndicators;
  financialPatterns?: unknown[];
  financialTrend?: unknown[];
  questionnaireAnswers?: Record<string, string>;
  signals?: Signals;
  risk?: Risk;
}

export interface AiInsightResult {
  keyFinding: string;
  whatDataSuggests: string;
  patternExplanation: string;
  nextSteps: string[];
  areasToReview: string[];
}

export interface AiInsightSuccessResponse {
  success: true;
  insufficientData: boolean;
  insight: AiInsightResult | null;
}

export type AiInsightResponse = AiInsightSuccessResponse | ErrorResponse;
