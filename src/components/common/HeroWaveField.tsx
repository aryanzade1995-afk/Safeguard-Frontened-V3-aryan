import React from 'react';

// Lightweight SVG/CSS-only hero background: DATA -> PATTERNS -> INSIGHT.
// Small scattered points drift on the left (raw data), align into flowing
// curves through the middle (patterns), and converge into a soft glow on
// the right, near the "How your data becomes insight" panel (insight).
// No canvas/video/deps — everything here is a handful of SVG primitives
// animated with CSS, gated by prefers-reduced-motion in index.css.
const PARTICLES: { x: number; y: number; dx: number; dy: number; dur: number; delay: number; cyan?: boolean }[] = [
  { x: 40, y: 90, dx: 18, dy: -10, dur: 7, delay: 0 },
  { x: 95, y: 190, dx: 22, dy: 8, dur: 8.5, delay: 1.2 },
  { x: 60, y: 270, dx: 16, dy: -6, dur: 6.5, delay: 2.4 },
  { x: 220, y: 60, dx: 24, dy: 12, dur: 9, delay: 0.6 },
  { x: 260, y: 210, dx: 20, dy: -14, dur: 7.5, delay: 3, cyan: true },
  { x: 330, y: 320, dx: 18, dy: 10, dur: 8, delay: 1.8 },
  { x: 450, y: 120, dx: 26, dy: -8, dur: 9.5, delay: 2.2 },
  { x: 505, y: 260, dx: 22, dy: 14, dur: 7, delay: 0.3, cyan: true },
  { x: 620, y: 90, dx: 20, dy: -10, dur: 8.5, delay: 3.6 },
  { x: 665, y: 220, dx: 18, dy: 8, dur: 6.8, delay: 1.4, cyan: true },
  { x: 760, y: 155, dx: 24, dy: -6, dur: 9, delay: 2.8, cyan: true },
  { x: 800, y: 270, dx: 16, dy: 10, dur: 7.4, delay: 0.9 },
];

export const HeroWaveField: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hero-wave-field absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none"
    >
      <svg viewBox="0 0 900 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id="heroWaveGradA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
            <stop offset="45%" stopColor="#6366F1" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="heroWaveGradB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0" />
            <stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4338CA" stopOpacity="0.45" />
          </linearGradient>
          <radialGradient id="heroWaveGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroWaveFade" cx="36%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FAF9F6" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#FAF9F6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FAF9F6" stopOpacity="0" />
          </radialGradient>
          <filter id="heroWaveBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* PATTERNS — layered flowing curves, offset for depth */}
        <path
          d="M-50 260 C 150 180, 300 320, 480 220 S 780 120, 950 200"
          stroke="url(#heroWaveGradA)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="hero-wave-line-a"
        />
        <path
          d="M-50 120 C 180 200, 340 40, 520 130 S 800 260, 950 150"
          stroke="url(#heroWaveGradB)"
          strokeWidth="1.75"
          strokeLinecap="round"
          fill="none"
          className="hero-wave-line-b"
        />
        <path
          d="M-50 330 C 200 300, 380 380, 560 300 S 820 200, 950 280"
          stroke="url(#heroWaveGradA)"
          strokeWidth="1.25"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
          className="hero-wave-line-b"
          style={{ animationDelay: '-11s' }}
        />

        {/* INSIGHT — soft glow where the flows converge, right side */}
        <circle
          cx="760"
          cy="170"
          r="90"
          fill="url(#heroWaveGlow)"
          filter="url(#heroWaveBlur)"
          className="hero-wave-glow"
        />

        {/* DATA -> PATTERNS — small points drifting along the flow */}
        {PARTICLES.map((p, i) => {
          const style: React.CSSProperties = {
            ['--particle-dx' as string]: `${p.dx}px`,
            ['--particle-dy' as string]: `${p.dy}px`,
            ['--particle-duration' as string]: `${p.dur}s`,
            ['--particle-delay' as string]: `${p.delay}s`,
          };
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i % 3 === 0 ? 3.5 : 2.5}
              fill={p.cyan ? '#22D3EE' : '#818CF8'}
              className="hero-wave-particle"
              style={style}
            />
          );
        })}

        {/* Readability fade — keeps the area behind the headline calm */}
        <rect x="0" y="0" width="900" height="400" fill="url(#heroWaveFade)" />
      </svg>
    </div>
  );
};

export default HeroWaveField;
