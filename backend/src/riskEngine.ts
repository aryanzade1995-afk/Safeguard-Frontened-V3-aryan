import { SIGNAL_KEYS, Risk, RiskLevel, Severity, Signals } from './types.js';

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const MAX_SCORE = SIGNAL_KEYS.length * SEVERITY_WEIGHTS.high; // 6 * 3 = 18

function levelFromNormalizedScore(normalizedScore: number): RiskLevel {
  if (normalizedScore < 0.25) return 'low';
  if (normalizedScore < 0.5) return 'moderate';
  if (normalizedScore < 0.75) return 'elevated';
  return 'high';
}

export function computeRisk(signals: Signals): Risk {
  const rawScore = SIGNAL_KEYS.reduce((sum, key) => sum + SEVERITY_WEIGHTS[signals[key].severity], 0);
  const normalizedScore = MAX_SCORE === 0 ? 0 : rawScore / MAX_SCORE;

  return {
    rawScore,
    maxScore: MAX_SCORE,
    normalizedScore: Math.round(normalizedScore * 1000) / 1000,
    level: levelFromNormalizedScore(normalizedScore),
  };
}
