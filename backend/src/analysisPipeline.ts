import { detectSignals } from './patternDetector.js';
import { computeRisk } from './riskEngine.js';
import { Analysis } from './types.js';

export async function runAnalysisPipeline(statement: string): Promise<Analysis> {
  const signals = await detectSignals(statement);
  const risk = computeRisk(signals);
  return { signals, risk };
}
