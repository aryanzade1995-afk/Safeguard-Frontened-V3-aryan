import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import { OllamaError, pingOllama } from './ollamaClient.js';
import { runAnalysisPipeline } from './analysisPipeline.js';
import { supabaseAdmin, verifyAccessToken, AuthVerificationError } from './supabaseAdmin.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const MAX_STATEMENT_LENGTH = 8000;

function validateStatement(statement: unknown): string | null {
  if (typeof statement !== 'string' || statement.trim().length === 0) {
    return '"statement" is required and must be a non-empty string.';
  }
  if (statement.length > MAX_STATEMENT_LENGTH) {
    return `"statement" exceeds the maximum length of ${MAX_STATEMENT_LENGTH} characters.`;
  }
  return null;
}

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'safeguard-backend',
    version: '0.0.1',
    endpoints: ['GET /api', 'GET /api/health', 'POST /api/analyze', 'POST /api/assessment'],
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

    const validationError = validateStatement(statement);
    if (validationError) {
      res.status(400).json({ success: false, error: validationError });
      return;
    }

    const analysis = await runAnalysisPipeline(statement.trim());

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/assessment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { statement, answers } = req.body ?? {};

    const validationError = validateStatement(statement);
    if (validationError) {
      res.status(400).json({ success: false, error: validationError });
      return;
    }
    if (answers !== undefined && (typeof answers !== 'object' || answers === null || Array.isArray(answers))) {
      res.status(400).json({ success: false, error: '"answers" must be an object of question id to answer string.' });
      return;
    }

    let userId: string;
    try {
      userId = await verifyAccessToken(req.header('authorization'));
    } catch (err) {
      if (err instanceof AuthVerificationError) {
        const status = err.code === 'NOT_CONFIGURED' ? 500 : 401;
        res.status(status).json({ success: false, error: err.message });
        return;
      }
      throw err;
    }

    const analysis = await runAnalysisPipeline(statement.trim());

    const { data, error } = await supabaseAdmin
      .from('assessments')
      .insert({ user_id: userId, answers: answers ?? {}, analysis })
      .select()
      .single();

    if (error || !data) {
      res.status(502).json({ success: false, error: error?.message || 'Could not save your assessment.' });
      return;
    }

    res.status(200).json({
      success: true,
      assessment: {
        id: data.id,
        userId: data.user_id,
        answers: data.answers,
        analysis: data.analysis,
        createdAt: data.created_at,
      },
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
