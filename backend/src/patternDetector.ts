import { generateJson, OllamaError } from './ollamaClient.js';
import { SIGNAL_KEYS, Severity, Signal, Signals, SignalKey } from './types.js';

const SEVERITIES: Severity[] = ['none', 'low', 'medium', 'high'];

const SIGNAL_DEFINITIONS: Record<SignalKey, string> = {
  income_control:
    'One person restricts, seizes, or dictates access to the other person\'s income or earnings.',
  financial_decision_control:
    'One person makes financial decisions unilaterally, excluding the other person from decisions that affect them.',
  forced_transfers:
    'The person is pressured, coerced, or required to transfer or hand over money against their wishes.',
  debt_pressure:
    'Debt is taken out in the person\'s name without consent, or used as leverage or a pressure tactic against them.',
  financial_surveillance:
    'The person\'s spending, accounts, or transactions are monitored or tracked without their consent.',
  economic_dependence:
    'The person is kept financially dependent, e.g. prevented from working, saving independently, or building financial autonomy.',
};

function buildPrompt(statement: string): string {
  const schema = SIGNAL_KEYS.map(
    (key) => `    "${key}": { "detected": boolean, "severity": "none"|"low"|"medium"|"high", "evidence": string }`
  ).join(',\n');

  const definitions = SIGNAL_KEYS.map((key) => `- ${key}: ${SIGNAL_DEFINITIONS[key]}`).join('\n');

  return `You are a financial-abuse pattern detection assistant. Analyze the statement below for signals of economic/financial abuse, strictly for the six categories defined here:
${definitions}

Rules:
- For each category, set "detected" to true only if the statement provides reasonable evidence.
- "severity" reflects how strong/explicit the evidence is: "none" (not detected), "low", "medium", or "high".
- "evidence" must be a short quote or close paraphrase from the statement supporting your judgment. Use an empty string "" if not detected.
- Do not invent details that are not present in the statement.
- Respond with ONLY a single JSON object, no explanation, no markdown fences, matching exactly this shape:
{
${schema}
}

Statement:
"""
${statement}
"""`;
}

function extractJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    // fall through
  }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = raw.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // fall through
    }
  }
  throw new OllamaError('BAD_RESPONSE', 'Could not parse JSON out of the model response');
}

function coerceSignal(value: unknown): Signal {
  if (typeof value !== 'object' || value === null) {
    return { detected: false, severity: 'none', evidence: '' };
  }
  const v = value as Record<string, unknown>;
  const severity: Severity = SEVERITIES.includes(v.severity as Severity)
    ? (v.severity as Severity)
    : 'none';
  const detected = typeof v.detected === 'boolean' ? v.detected : severity !== 'none';
  const evidence = typeof v.evidence === 'string' ? v.evidence : '';
  return {
    detected,
    severity: detected ? severity : 'none',
    evidence: detected ? evidence : '',
  };
}

export async function detectSignals(statement: string): Promise<Signals> {
  const prompt = buildPrompt(statement);
  const raw = await generateJson(prompt);
  const parsed = extractJsonObject(raw);

  if (typeof parsed !== 'object' || parsed === null) {
    throw new OllamaError('BAD_RESPONSE', 'Model response JSON was not an object');
  }

  const obj = parsed as Record<string, unknown>;
  const signals = {} as Signals;
  for (const key of SIGNAL_KEYS) {
    signals[key] = coerceSignal(obj[key]);
  }
  return signals;
}
