import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'indigo' | 'emerald' | 'amber' | 'neutral';
  showValueLabel?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'indigo',
  showValueLabel = false,
  valuePrefix = '',
  valueSuffix = '%',
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantBarStyles = {
    indigo: 'bg-indigo-800',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    neutral: 'bg-stone-700',
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showValueLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          <span>Progress</span>
          <span>
            {valuePrefix}
            {Math.round(percentage)}
            {valueSuffix}
          </span>
        </div>
      )}
      <div className={`w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/60 ${sizeStyles[size]}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${variantBarStyles[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export interface RadialProgressProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  variant?: 'indigo' | 'emerald' | 'amber';
  /** Overrides the entire center label — use sparingly; the default split
   *  score/maxLabel layout is what keeps this aligned at any size. */
  label?: string;
  sublabel?: string;
  maxLabel?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  variant = 'indigo',
  label,
  sublabel,
  maxLabel = '/100',
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const gradientStops: Record<'indigo' | 'emerald' | 'amber', [string, string]> = {
    indigo: ['#818CF8', '#3730A3'],
    emerald: ['#6EE7B7', '#047857'],
    amber: ['#FCD34D', '#B45309'],
  };
  const [gradFrom, gradTo] = gradientStops[variant];
  const gradientId = `radial-grad-${variant}-${size}-${strokeWidth}`;

  // Font size scales with the ring's diameter so the score never looks
  // cramped or oversized regardless of where this component is placed.
  const scoreFontSize = Math.max(18, Math.round(size * 0.26));
  const maxLabelFontSize = Math.max(10, Math.round(scoreFontSize * 0.42));

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {/* Soft ambient glow behind the ring for a bit of depth */}
      <div
        aria-hidden="true"
        className="absolute inset-[6%] rounded-full blur-xl opacity-40"
        style={{ background: `radial-gradient(circle, ${gradTo}30, transparent 72%)` }}
      />

      <svg width={size} height={size} className="-rotate-90 relative">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradFrom} />
            <stop offset="100%" stopColor={gradTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F0ED" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        {label ? (
          <span
            className="font-extrabold text-slate-900 tracking-tight leading-none"
            style={{ fontSize: scoreFontSize }}
          >
            {label}
          </span>
        ) : (
          <div className="flex items-baseline">
            <span
              className="font-extrabold text-slate-900 tracking-tight leading-none"
              style={{ fontSize: scoreFontSize }}
            >
              {Math.round(normalizedValue)}
            </span>
            <span
              className="font-bold text-slate-400 leading-none ml-0.5"
              style={{ fontSize: maxLabelFontSize }}
            >
              {maxLabel}
            </span>
          </div>
        )}
        {sublabel && (
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 leading-tight max-w-[85%]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
