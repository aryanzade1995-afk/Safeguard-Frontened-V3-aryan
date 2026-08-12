import { ChatHistoryItem, ChatResponsePayload } from '../types';

// Same FastAPI backend as financialHealthService.ts (bank-statement parsing,
// financial health, chat, voice) — reuses the existing POST /api/chat route
// exactly as implemented there. No chat logic is duplicated on the frontend.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

/**
 * Sends a message to the existing Safeguard AI chat assistant. Passes the
 * signed-in user's real id (or null for an anonymous visitor) so the
 * backend can optionally attach that user's own context — never hardcoded.
 * `history` is the prior turns of the current open chat session (oldest
 * first) so the backend can answer follow-up questions with context; the
 * backend still routes only off the current `message`.
 */
export async function sendChatMessage(
  message: string,
  userId: string | null,
  history: ChatHistoryItem[] = [],
  language: string = 'en'
): Promise<ChatResponsePayload> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_id: userId,
        use_user_context: true,
        language,
        history,
      }),
    });
  } catch {
    throw new Error('Unable to reach the chat assistant. Please try again.');
  }

  let data: ChatResponsePayload | { detail?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error('The chat assistant returned an unexpected response.');
  }

  if (!res.ok) {
    const message = 'detail' in data && data.detail ? data.detail : `Chat request failed with status ${res.status}.`;
    throw new Error(message);
  }

  return data as ChatResponsePayload;
}
