import { FinancialAnalyzeSuccessResponse, FinancialHealthData, FinancialHealthResponse } from '../types';

// Separate FastAPI backend (bank-statement parsing, financial health,
// chat, voice) — distinct from VITE_BACKEND_URL, which is the Node
// analysis/assessment service.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

/**
 * Fetches the signed-in user's latest financial health overview. Returns
 * null when no financial analysis has been saved for this user yet
 * (found: false) — never fabricated. Throws on network/server failure.
 */
export async function getFinancialHealth(userId: string): Promise<FinancialHealthData | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/financial/health?user_id=${encodeURIComponent(userId)}`);
  } catch {
    throw new Error('Unable to reach the financial analysis service. Please make sure the backend is running and try again.');
  }

  let payload: FinancialHealthResponse;
  try {
    payload = (await res.json()) as FinancialHealthResponse;
  } catch {
    throw new Error('The financial analysis service returned an unexpected response.');
  }

  if (!res.ok) {
    throw new Error(`Financial health request failed with status ${res.status}.`);
  }

  return payload.found ? payload.data : null;
}

/**
 * Uploads a bank statement for analysis. The backend parses it, saves a new
 * row in `financial_analyses` (always the latest for this user), and
 * returns that row's id/filename/created_at. Every call creates a new
 * record — nothing here reuses or caches a previous analysis.
 */
export async function analyzeFinancialStatement(
  file: File,
  userId: string
): Promise<FinancialAnalyzeSuccessResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/financial/analyze`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Unable to reach the financial analysis service. Please make sure the backend is running and try again.');
  }

  let payload: FinancialAnalyzeSuccessResponse | { status: 'error'; detail?: string };
  try {
    payload = await res.json();
  } catch {
    throw new Error('The financial analysis service returned an unexpected response.');
  }

  if (!res.ok || payload.status !== 'success') {
    const message = 'detail' in payload && payload.detail ? payload.detail : `Statement analysis failed with status ${res.status}.`;
    throw new Error(message);
  }

  return payload;
}
