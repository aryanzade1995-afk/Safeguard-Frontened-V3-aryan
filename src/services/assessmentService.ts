import { supabase } from './supabaseClient';
import { Analysis, Assessment } from '../types';

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

export async function createAssessment(
  userId: string,
  answers: Record<string, string>,
  analysis: Analysis
): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({ user_id: userId, answers, analysis })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Could not save your assessment.');
  }
  return mapRow(data as AssessmentRow);
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
