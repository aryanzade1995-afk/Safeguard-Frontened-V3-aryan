import { GoogleGenAI, Type } from '@google/genai';
import { config } from './config.js';
import { AiInsightRequestBody, AiInsightResult } from './types.js';

export class GeminiError extends Error {
  code: 'NOT_CONFIGURED' | 'REQUEST_FAILED' | 'BAD_RESPONSE';

  constructor(code: GeminiError['code'], message: string) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
  }
}

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!config.geminiApiKey) {
    throw new GeminiError('NOT_CONFIGURED', 'AI insights are not configured on this server.');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return cachedClient;
}

// Only calls Gemini when there is something real to reason about — never
// spends a request (or lets the model improvise) on a near-empty dataset.
export function hasEnoughInsightData(body: AiInsightRequestBody): boolean {
  const hasPatterns = (body.financialPatterns?.length ?? 0) > 0;
  const hasWithdrawals = body.financialIndicators?.cash_withdrawals.status === 'observed';
  const hasTransfers = body.financialIndicators?.recurring_transfers.status === 'observed';
  const hasTrend = body.financialSummary ? body.financialSummary.spending_trend_status !== 'insufficient_data' : false;
  const hasQuestionnaire = Boolean(
    body.questionnaireAnswers && Object.keys(body.questionnaireAnswers).length > 0
  );
  // A completed assessment (signals + risk) always represents real,
  // substantive analysis — even a "nothing detected" result is itself a
  // genuine, non-fabricated finding worth reflecting back to the user.
  const hasSignals = Boolean(body.signals);
  const hasRisk = Boolean(body.risk);
  return hasPatterns || hasWithdrawals || hasTransfers || hasTrend || hasQuestionnaire || hasSignals || hasRisk;
}

const RESULT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    keyFinding: {
      type: Type.STRING,
      description: 'One concise sentence naming the single most notable thing in this data.',
    },
    whatDataSuggests: {
      type: Type.STRING,
      description: '1-2 sentences on what the numbers/patterns suggest, grounded only in the provided data.',
    },
    patternExplanation: {
      type: Type.STRING,
      description:
        '1-2 sentences explaining the most relevant detected pattern or trend and why it may be worth a look.',
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 short, practical, non-alarming next steps directly tied to this data.',
    },
    areasToReview: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 3 optional additional areas worth a closer look. Empty array if nothing else stands out.',
    },
  },
  required: ['keyFinding', 'whatDataSuggests', 'patternExplanation', 'nextSteps', 'areasToReview'],
};

function buildPrompt(body: AiInsightRequestBody): string {
  // Only include keys the caller actually provided — Financial Pattern
  // Overview sends financial* fields, Financial Autonomy Report sends
  // signals/risk/questionnaireAnswers; never pad the other shape with
  // empty/null placeholders that could read as "checked, found nothing".
  const data: Record<string, unknown> = {};
  if (body.financialSummary) data.financialSummary = body.financialSummary;
  if (body.financialIndicators) data.financialIndicators = body.financialIndicators;
  if (body.financialPatterns) data.financialPatterns = body.financialPatterns;
  if (body.financialTrend) data.financialTrend = body.financialTrend;
  if (body.signals) data.detectedSignals = body.signals;
  if (body.risk) data.overallRisk = body.risk;
  if (body.questionnaireAnswers && Object.keys(body.questionnaireAnswers).length > 0) {
    data.questionnaireContext = body.questionnaireAnswers;
  }

  return `You are Safeguard's private financial-autonomy reflection assistant. You help a user understand patterns in their OWN data — this may be their bank-statement-derived financial activity, the results of a private financial-autonomy questionnaire (which detects signals like income control, forced transfers, or economic dependence), or both. You are not a licensed financial or legal advisor and must never diagnose abuse, coercion, or wrongdoing.

Rules:
- Reason ONLY from the JSON data given below. Never invent transactions, amounts, dates, questionnaire answers, or personal circumstances that are not present in it.
- Keep language calm, plain, and non-alarming — this is a private reflection tool, not a verdict.
- "nextSteps" must be practical and directly tied to the data given (e.g. a specific detected signal category, a specific questionnaire response, or a specific spending category) — never generic advice unrelated to this data.
- "areasToReview" is optional — return an empty array if nothing else stands out.
- If the data shows no notable patterns (e.g. no signals detected, stable finances), say so honestly and positively in "whatDataSuggests" — do not invent a concern to fill space.
- Respond with ONLY a single JSON object matching the required schema. No markdown, no extra commentary.

DATA:
${JSON.stringify(data, null, 2)}`;
}

function coerceResult(value: unknown): AiInsightResult {
  if (typeof value !== 'object' || value === null) {
    throw new GeminiError('BAD_RESPONSE', 'The AI insight service returned an unexpected response shape.');
  }
  const v = value as Record<string, unknown>;
  const keyFinding = typeof v.keyFinding === 'string' ? v.keyFinding.trim() : '';
  const whatDataSuggests = typeof v.whatDataSuggests === 'string' ? v.whatDataSuggests.trim() : '';
  const patternExplanation = typeof v.patternExplanation === 'string' ? v.patternExplanation.trim() : '';

  if (!keyFinding || !whatDataSuggests) {
    throw new GeminiError('BAD_RESPONSE', 'The AI insight service returned an incomplete response.');
  }

  const nextSteps = Array.isArray(v.nextSteps)
    ? v.nextSteps.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : [];
  const areasToReview = Array.isArray(v.areasToReview)
    ? v.areasToReview.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : [];

  return { keyFinding, whatDataSuggests, patternExplanation, nextSteps, areasToReview };
}

export async function generateFinancialInsight(body: AiInsightRequestBody): Promise<AiInsightResult> {
  const ai = getClient();
  const prompt = buildPrompt(body);

  let raw: string | undefined;
  try {
    const response = await ai.models.generateContent({
      // "latest" alias rather than a pinned version — pinned preview/GA
      // model names get sunset for new API keys (confirmed: this key's
      // gemini-2.5-flash call 404s with "no longer available to new
      // users"), so tracking the alias avoids re-breaking on the next cycle.
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESULT_SCHEMA,
        temperature: 0.4,
      },
    });
    raw = response.text;
  } catch (err) {
    throw new GeminiError(
      'REQUEST_FAILED',
      err instanceof Error ? err.message : 'The AI insight service could not be reached.'
    );
  }

  if (!raw) {
    throw new GeminiError('BAD_RESPONSE', 'The AI insight service returned an empty response.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GeminiError('BAD_RESPONSE', 'The AI insight service returned a response that could not be parsed.');
  }

  return coerceResult(parsed);
}
