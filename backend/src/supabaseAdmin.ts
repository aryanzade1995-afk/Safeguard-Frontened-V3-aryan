import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Service-role client — server-side only. Used to (a) verify a caller's
// access token via auth.getUser(), and (b) perform trusted writes to
// `assessments` that bypass RLS, safe because user_id is set from the
// independently-verified token, never from client-supplied input.
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseServiceRoleKey || 'placeholder-service-role-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export type AuthErrorCode = 'NOT_CONFIGURED' | 'MISSING_TOKEN' | 'INVALID_TOKEN';

export class AuthVerificationError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthVerificationError';
    this.code = code;
  }
}

/** Verifies `Authorization: Bearer <token>` and returns the caller's user id. */
export async function verifyAccessToken(authHeader: string | undefined): Promise<string> {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new AuthVerificationError('NOT_CONFIGURED', 'Backend is not configured with Supabase credentials.');
  }
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthVerificationError('MISSING_TOKEN', 'Missing or malformed Authorization header.');
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new AuthVerificationError('MISSING_TOKEN', 'Missing bearer token.');
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    throw new AuthVerificationError('INVALID_TOKEN', 'Invalid or expired session. Please sign in again.');
  }
  return data.user.id;
}
