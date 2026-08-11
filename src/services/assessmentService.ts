import { supabase } from './supabaseClient';
import { Analysis, Assessment, AssessmentSubmissionResponse } from '../types';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

interface AssessmentRow {
  id: string;
  user_id: string;
  answers: Record<string, string>;
  analysis: Analysis;
  created_at: string;
}

function mapRow(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    userId: row.user_id,
    answers: row.answers,
    analysis: row.analysis,
    createdAt: row.created_at,
  };
}

/**
 * Submits questionnaire answers (plus any statement text built from them and
 * optional financial data) to the backend, which runs the model, persists
 * the row in Supabase, and returns the saved assessment. Requires an active
 * Supabase session — the access token is forwarded so the backend can
 * verify identity and attribute the row to the caller itself.
 */
export async function submitAssessment(
  statement: string,
  answers: Record<string, string>
): Promise<Assessment> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ statement, answers }),
    });
  } catch {
    throw new Error('Unable to reach the analysis service. Please make sure the backend is running and try again.');
  }

  let data: AssessmentSubmissionResponse;
  try {
    data = (await res.json()) as AssessmentSubmissionResponse;
  } catch {
    throw new Error('The analysis service returned an unexpected response.');
  }

  if (!res.ok || data.success !== true) {
    const message = data.success === false ? data.error : `Assessment request failed with status ${res.status}.`;
    throw new Error(message);
  }

  return data.assessment;
}

// Ordered most-recent first. RLS restricts results to the caller's own rows.
export async function getMyAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return ((data as AssessmentRow[] | null) || []).map(mapRow);
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  const { data, error } = await supabase.from('assessments').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data ? mapRow(data as AssessmentRow) : null;
}

export async function deleteAssessment(id: string): Promise<void> {
  const { error } = await supabase.from('assessments').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}
