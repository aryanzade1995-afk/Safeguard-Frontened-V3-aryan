import React, { useEffect, useState } from 'react';
import { AnalysisRiskLevel } from '../../types';

export interface AutonomyScoreGaugeProps {
  // 0-100, always the same real formula used everywhere else in the app
  // (1 - risk.normalizedScore) * 100 — this component only changes how
  // that existing value is drawn, never what it is.
  value: number;
  level: AnalysisRiskLevel;
  tierLabel: string;
  size?: number;
}

const LEVEL_COLORS: Record<AnalysisRiskLevel, { from: string; to: string; text: string; bg: string; border: string }> = {
  low: { from: '#6EE7B7', to: '#047857', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  moderate: { from: '#A5B4FC', to: '#4338CA', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  elevated: { from: '#FCD34D', to: '#B45309', text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { from: '#FCA5A5', to: '#B91C1C', text: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200' },
};

// A premium gauge dial — gradient progress ring, quarter tick marks, an
// end-of-arc marker dot, a soft tier-colored glow, and a mount-in fill
// animation. Purely a presentation swap for the existing RadialProgress
// score display; the underlying value/level are untouched real data.
export const AutonomyScoreGauge: React.FC<AutonomyScoreGaugeProps> = ({ value, level, tierLabel, size = 176 }) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const clamped = Math.min(100, Math.max(0, value));
    const raf = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashOffset = circumference - (animated / 100) * circumference;
  const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS.moderate;
  const gradientId = `autonomy-gauge-${level}-${size}`;

  const angleForPercent = (p: number) => ((p / 100) * 360 - 90) * (Math.PI / 180);
  const ticks = [0, 25, 50, 75, 100];
  const markerAngle = angleForPercent(animated);
  const markerX = size / 2 + radius * Math.cos(markerAngle);
  const markerY = size / 2 + radius * Math.sin(markerAngle);

  return (
    <div className="relative inline-flex flex-col items-center shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          aria-hidden="true"
          className="absolute inset-[10%] rounded-full blur-2xl opacity-30 transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${colors.to}66, transparent 70%)` }}
        />

        <svg width={size} height={size} className="relative">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>

          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F0ED" strokeWidth={strokeWidth} fill="transparent" />

          {ticks.map((p) => {
            const a = angleForPercent(p);
            const inner = radius - strokeWidth / 2 - 3;
            const outer = radius + strokeWidth / 2 + 3;
            return (
              <line
                key={p}
                x1={size / 2 + inner * Math.cos(a)}
                y1={size / 2 + inner * Math.sin(a)}
                x2={size / 2 + outer * Math.cos(a)}
                y2={size / 2 + outer * Math.sin(a)}
                stroke="#E7E5E4"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            fill="transparent"
            className="-rotate-90 origin-center transition-all duration-1000 ease-out"
          />

          {animated > 1.5 && (
            <circle
              cx={markerX}
              cy={markerY}
              r={strokeWidth / 2 + 2}
              fill="white"
              stroke={colors.to}
              strokeWidth={3}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
            {Math.round(animated)}
          </span>
          <span className="text-[11px] font-bold text-slate-400 mt-1">/ 100</span>
        </div>
      </div>

      <span
        className={`mt-3 px-3.5 py-1.5 rounded-full text-xs font-extrabold border inline-flex items-center space-x-1.5 ${colors.bg} ${colors.text} ${colors.border}`}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.to }} />
        <span>{tierLabel}</span>
      </span>
    </div>
  );
};

export default AutonomyScoreGauge;
