import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import { OllamaError, pingOllama } from './ollamaClient.js';
import { runAnalysisPipeline } from './analysisPipeline.js';
import { supabaseAdmin, verifyAccessToken, AuthVerificationError } from './supabaseAdmin.js';
import { GeminiError, generateFinancialInsight, hasEnoughInsightData } from './geminiClient.js';
import { AiInsightRequestBody } from './types.js';

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

// Accepts either (or both) of two real data shapes: financial-health data
// (Financial Pattern Overview) and assessment signals/risk (Financial
// Autonomy Report) — every field is optional here, but at least one must be
// present, and any field that IS present must be well-formed.
function validateAiInsightBody(body: unknown): { value: AiInsightRequestBody } | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Request body must be a JSON object.' };
  }
  const b = body as Record<string, unknown>;
  const { financialSummary, financialIndicators, financialPatterns, financialTrend, questionnaireAnswers, signals, risk } = b;

  if (financialSummary !== undefined && (typeof financialSummary !== 'object' || financialSummary === null)) {
    return { error: '"financialSummary" must be an object when provided.' };
  }
  if (
    financialIndicators !== undefined &&
    (typeof financialIndicators !== 'object' ||
      financialIndicators === null ||
      typeof (financialIndicators as Record<string, unknown>).cash_withdrawals !== 'object' ||
      typeof (financialIndicators as Record<string, unknown>).recurring_transfers !== 'object')
  ) {
    return { error: '"financialIndicators" must include cash_withdrawals and recurring_transfers objects when provided.' };
  }
  if (financialPatterns !== undefined && !Array.isArray(financialPatterns)) {
    return { error: '"financialPatterns" must be an array when provided.' };
  }
  if (financialTrend !== undefined && !Array.isArray(financialTrend)) {
    return { error: '"financialTrend" must be an array when provided.' };
  }
  if (
    questionnaireAnswers !== undefined &&
    (typeof questionnaireAnswers !== 'object' || questionnaireAnswers === null || Array.isArray(questionnaireAnswers))
  ) {
    return { error: '"questionnaireAnswers" must be an object of question id to answer string.' };
  }
  if (signals !== undefined && (typeof signals !== 'object' || signals === null || Array.isArray(signals))) {
    return { error: '"signals" must be an object when provided.' };
  }
  if (risk !== undefined && (typeof risk !== 'object' || risk === null)) {
    return { error: '"risk" must be an object when provided.' };
  }

  const hasAnyField =
    financialSummary !== undefined ||
    financialIndicators !== undefined ||
    financialPatterns !== undefined ||
    financialTrend !== undefined ||
    signals !== undefined ||
    risk !== undefined ||
    (questionnaireAnswers !== undefined && Object.keys(questionnaireAnswers as object).length > 0);
  if (!hasAnyField) {
    return {
      error:
        'At least one of financialSummary, financialIndicators, financialPatterns, financialTrend, signals, risk, or questionnaireAnswers is required.',
    };
  }

  return {
    value: {
      financialSummary: financialSummary as AiInsightRequestBody['financialSummary'],
      financialIndicators: financialIndicators as AiInsightRequestBody['financialIndicators'],
      financialPatterns: financialPatterns as unknown[] | undefined,
      financialTrend: financialTrend as unknown[] | undefined,
      questionnaireAnswers: questionnaireAnswers as Record<string, string> | undefined,
      signals: signals as AiInsightRequestBody['signals'],
      risk: risk as AiInsightRequestBody['risk'],
    },
  };
}

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'safeguard-backend',
    version: '0.0.1',
    endpoints: ['GET /api', 'GET /api/health', 'POST /api/analyze', 'POST /api/assessment', 'POST /api/ai-insight'],
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

app.post('/api/ai-insight', async (req: Request, res: Response, next: NextFunction) => {
  try {
    try {
      await verifyAccessToken(req.header('authorization'));
    } catch (err) {
      if (err instanceof AuthVerificationError) {
        const status = err.code === 'NOT_CONFIGURED' ? 500 : 401;
        res.status(status).json({ success: false, error: err.message });
        return;
      }
      throw err;
    }

    const validation = validateAiInsightBody(req.body);
    if ('error' in validation) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    if (!hasEnoughInsightData(validation.value)) {
      res.status(200).json({ success: true, insufficientData: true, insight: null });
      return;
    }

    const insight = await generateFinancialInsight(validation.value);
    res.status(200).json({ success: true, insufficientData: false, insight });
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

  if (err instanceof GeminiError) {
    const status = err.code === 'NOT_CONFIGURED' ? 500 : 502;
    res.status(status).json({ success: false, error: err.message });
    return;
  }

  // express.json() throws a body-parser SyntaxError (status 400) for
  // malformed JSON — a routine client mistake, not a server fault. Without
  // this check it fell through to the generic 500 below and got logged as
  // if the server itself had failed.
  if (err instanceof SyntaxError && (err as { status?: number; type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ success: false, error: 'Request body must be valid JSON.' });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Safeguard backend listening on http://localhost:${config.port}`);
  console.log(`Using Ollama at ${config.ollamaBaseUrl} with model ${config.ollamaModel}`);
});
