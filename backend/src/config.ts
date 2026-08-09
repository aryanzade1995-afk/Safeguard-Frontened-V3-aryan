import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4000,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen3:8b',
  ollamaTimeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS) || 60000,
};
