import { supabase } from './supabaseClient';
import { AiInsightRequest, AiInsightResponse, AiInsightResult } from '../types';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

export interface AiInsightOutcome {
  insufficientData: boolean;
  insight: AiInsightResult | null;
}

/**
 * Sends the user's real, already-fetched financial analysis (never
 * fabricated on the frontend) to the backend, which forwards it to Gemini
 * and returns a grounded, structured insight. Requires an active Supabase
 * session — same auth convention as submitAssessment.
 */
export async function generateAiInsight(request: AiInsightRequest): Promise<AiInsightOutcome> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/ai-insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('Unable to reach the AI insight service. Please make sure the backend is running and try again.');
  }

  let data: AiInsightResponse;
  try {
    data = (await res.json()) as AiInsightResponse;
  } catch {
    throw new Error('The AI insight service returned an unexpected response.');
  }

  if (!res.ok || data.success !== true) {
    const message = data.success === false ? data.error : `AI insight request failed with status ${res.status}.`;
    throw new Error(message);
  }

  return { insufficientData: data.insufficientData, insight: data.insight };
}
