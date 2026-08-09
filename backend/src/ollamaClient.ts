import { config } from './config.js';

export type OllamaErrorCode = 'UNAVAILABLE' | 'TIMEOUT' | 'BAD_RESPONSE';

export class OllamaError extends Error {
  code: OllamaErrorCode;

  constructor(code: OllamaErrorCode, message: string) {
    super(message);
    this.name = 'OllamaError';
    this.code = code;
  }
}

interface OllamaGenerateResult {
  response: string;
}

export async function generateJson(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.ollamaTimeoutMs);

  let res: Response;
  try {
    res = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new OllamaError('TIMEOUT', `Ollama request timed out after ${config.ollamaTimeoutMs}ms`);
    }
    throw new OllamaError(
      'UNAVAILABLE',
      `Unable to reach Ollama at ${config.ollamaBaseUrl}. Is "ollama serve" running?`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new OllamaError('BAD_RESPONSE', `Ollama returned ${res.status}: ${body.slice(0, 300)}`);
  }

  let data: OllamaGenerateResult;
  try {
    data = (await res.json()) as OllamaGenerateResult;
  } catch {
    throw new OllamaError('BAD_RESPONSE', 'Ollama returned a non-JSON response body');
  }

  if (typeof data.response !== 'string') {
    throw new OllamaError('BAD_RESPONSE', 'Ollama response missing "response" field');
  }

  return data.response;
}

export async function pingOllama(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${config.ollamaBaseUrl}/api/tags`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
