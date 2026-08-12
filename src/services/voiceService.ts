import { VoiceConfigResponse } from '../types';

// Same FastAPI backend as chatService.ts/financialHealthService.ts. This is
// the single source of truth for supported app languages (currently
// en/hi/mr) and their BCP-47 speech codes — never duplicated/invented here.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export async function getVoiceConfig(language: string): Promise<VoiceConfigResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/voice/config?language=${encodeURIComponent(language)}`);
  } catch {
    throw new Error('Unable to reach the voice/language service. Please try again.');
  }

  let data: VoiceConfigResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error('The voice/language service returned an unexpected response.');
  }

  if (!res.ok) {
    throw new Error(`Voice config request failed with status ${res.status}.`);
  }

  return data;
}
