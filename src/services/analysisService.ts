import { Analysis, AnalyzeResponse, Transaction } from '../types';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

export interface AnsweredQuestion {
  question: string;
  answer: string;
}

/**
 * Turns questionnaire Q&A pairs into a first-person statement for the
 * backend's pattern detector. Unanswered questions are skipped.
 */
export function buildStatementFromAnswers(answers: AnsweredQuestion[]): string {
  return answers
    .filter((entry) => entry.answer.trim().length > 0)
    .map((entry) => `Question: ${entry.question}\nAnswer: ${entry.answer}`)
    .join('\n\n');
}

/**
 * Turns the user's (real or demo) transaction list into a short first-person
 * summary appended to the questionnaire statement, so financial-analysis
 * data genuinely reaches the backend when it exists — and is correctly
 * omitted entirely when the user chose to skip providing any.
 */
export function buildStatementFromTransactions(transactions: Transaction[]): string {
  if (transactions.length === 0) return '';

  const flagged = transactions.filter((t) => t.flagged);
  const accountCount = new Set(transactions.map((t) => t.accountName)).size;
  const lines = [
    `Financial data summary: ${transactions.length} transactions reviewed across ${accountCount} account(s).`,
  ];

  if (flagged.length > 0) {
    const examples = flagged
      .slice(0, 5)
      .map((t) => `"${t.description}" (₹${t.amount}, ${t.flagReason || 'flagged'})`)
      .join('; ');
    lines.push(`${flagged.length} transaction(s) were flagged for review, for example: ${examples}.`);
  }

  return lines.join('\n');
}

export async function analyzeStatement(statement: string): Promise<Analysis> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement }),
    });
  } catch {
    throw new Error('Unable to reach the analysis service. Please make sure the backend is running and try again.');
  }

  let data: AnalyzeResponse;
  try {
    data = (await res.json()) as AnalyzeResponse;
  } catch {
    throw new Error('The analysis service returned an unexpected response.');
  }

  if (!res.ok || data.success !== true) {
    const message = data.success === false ? data.error : `Analysis request failed with status ${res.status}.`;
    throw new Error(message);
  }

  return data.analysis;
}
