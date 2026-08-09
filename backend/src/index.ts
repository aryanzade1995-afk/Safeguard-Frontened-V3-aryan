import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import { OllamaError, pingOllama } from './ollamaClient.js';
import { detectSignals } from './patternDetector.js';
import { computeRisk } from './riskEngine.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const MAX_STATEMENT_LENGTH = 8000;

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'safeguard-backend',
    version: '0.0.1',
    endpoints: ['GET /api', 'GET /api/health', 'POST /api/analyze'],
  });
});

app.get('/api/health', async (_req: Request, res: Response) => {
  const ollamaUp = await pingOllama();
  res.status(ollamaUp ? 200 : 503).json({
    success: true,
    status: ollamaUp ? 'ok' : 'degraded',
    ollama: {
      reachable: ollamaUp,
      baseUrl: config.ollamaBaseUrl,
      model: config.ollamaModel,
    },
  });
});

app.post('/api/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { statement } = req.body ?? {};

    if (typeof statement !== 'string' || statement.trim().length === 0) {
      res.status(400).json({ success: false, error: '"statement" is required and must be a non-empty string.' });
      return;
    }

    if (statement.length > MAX_STATEMENT_LENGTH) {
      res.status(400).json({
        success: false,
        error: `"statement" exceeds the maximum length of ${MAX_STATEMENT_LENGTH} characters.`,
      });
      return;
    }

    const signals = await detectSignals(statement.trim());
    const risk = computeRisk(signals);

    res.status(200).json({
      success: true,
      analysis: { signals, risk },
    });
  } catch (err) {
    next(err);
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof OllamaError) {
    const status = err.code === 'TIMEOUT' ? 504 : 502;
    res.status(status).json({ success: false, error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Safeguard backend listening on http://localhost:${config.port}`);
  console.log(`Using Ollama at ${config.ollamaBaseUrl} with model ${config.ollamaModel}`);
});
