import React from 'react';

// App-wide ambient background: thin dashed flowing paths + tiny drifting
// particles, fixed behind every page (mounted once in App.tsx, outside the
// route switch, so it never restarts on navigation). Colors are drawn from
// the site's own theme (indigo/violet primary, amber accent) — no new
// palette. Pure SVG/CSS, no canvas/JS animation loop, no per-frame React
// state — every motion here is a CSS/SMIL-free `animation` running on the
// compositor. Density is trimmed at each breakpoint via plain Tailwind
// `hidden md:block` / `hidden lg:block` wrappers (zero JS, zero re-renders).
// Reduced-motion handling lives in index.css (`.hero-wave-field` rules).
interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
  r: number;
  amber?: boolean;
  blur?: boolean;
}

// Always visible — the base density shown on mobile.
const PARTICLES_CORE: Particle[] = [
  { x: 60, y: 90, dx: 18, dy: -10, dur: 7, delay: 0, r: 2.5 },
  { x: 140, y: 220, dx: 22, dy: 8, dur: 8.5, delay: 1.2, r: 4 },
  { x: 320, y: 260, dx: 20, dy: -14, dur: 7.5, delay: 3, r: 3 },
  { x: 480, y: 140, dx: 26, dy: -8, dur: 9.5, delay: 2.2, r: 5, blur: true },
  { x: 650, y: 90, dx: 20, dy: -10, dur: 8.5, delay: 3.6, r: 3, amber: true },
  { x: 800, y: 160, dx: 24, dy: -6, dur: 9, delay: 2.8, r: 2 },
  { x: 950, y: 220, dx: 20, dy: -12, dur: 8.2, delay: 2, r: 4, amber: true },
  { x: 1080, y: 120, dx: 18, dy: -10, dur: 8.8, delay: 3.2, r: 3 },
];

// Added from `sm` breakpoint up (tablet).
const PARTICLES_TABLET: Particle[] = [
  { x: 90, y: 340, dx: 16, dy: -6, dur: 6.5, delay: 2.4, r: 2 },
  { x: 400, y: 400, dx: 18, dy: 10, dur: 8, delay: 1.8, r: 6, amber: true, blur: true },
  { x: 560, y: 320, dx: 22, dy: 14, dur: 7, delay: 0.3, r: 3 },
  { x: 720, y: 260, dx: 18, dy: 8, dur: 6.8, delay: 1.4, r: 2.5 },
];

// Added from `lg` breakpoint up (desktop) — full density.
const PARTICLES_DESKTOP: Particle[] = [
  { x: 260, y: 70, dx: 24, dy: 12, dur: 9, delay: 0.6, r: 3.5 },
  { x: 860, y: 380, dx: 16, dy: 10, dur: 7.4, delay: 0.9, r: 5, blur: true },
  { x: 1020, y: 420, dx: 22, dy: 8, dur: 7.8, delay: 0.5, r: 2 },
  { x: 1130, y: 300, dx: 16, dy: 12, dur: 6.9, delay: 1.6, r: 7, amber: true, blur: true },
  { x: 30, y: 480, dx: 20, dy: -8, dur: 8.6, delay: 3.8, r: 2.5 },
  { x: 1150, y: 60, dx: 18, dy: 14, dur: 7.2, delay: 1.1, r: 3 },
];

const renderParticles = (particles: Particle[]) =>
  particles.map((p, i) => {
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
        r={p.r}
        fill={p.amber ? '#F59E0B' : '#818CF8'}
        fillOpacity="1"
        className="hero-wave-particle"
        filter={p.blur ? 'url(#heroWaveSoftBlur)' : undefined}
        style={style}
      />
    );
  });

export const HeroWaveField: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hero-wave-field fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none opacity-100"
    >
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id="heroWaveGradA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
            <stop offset="45%" stopColor="#6366F1" stopOpacity="1" />
            <stop offset="100%" stopColor="#4338CA" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="heroWaveGradB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0" />
            <stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="heroWaveGradC" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0" />
            <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="heroWaveGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroWaveGlowAmber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroWaveFade" cx="50%" cy="46%" r="62%">
            <stop offset="0%" stopColor="#FAF9F6" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#FAF9F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FAF9F6" stopOpacity="0" />
          </radialGradient>
          <filter id="heroWaveBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
          {/* Lighter blur used on a subset of particles for depth — most
              particles stay crisp; only a few read as "further back". */}
          <filter id="heroWaveSoftBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        {/* CORE flowing curves — always visible, spanning the full canvas */}
        <path
          d="M-80 340 C 200 220, 380 460, 620 300 S 980 160, 1280 280"
          stroke="url(#heroWaveGradA)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="hero-wave-line-a"
        />
        <path
          d="M-80 140 C 240 260, 420 40, 660 170 S 1040 340, 1280 200"
          stroke="url(#heroWaveGradB)"
          strokeWidth="1.25"
          strokeLinecap="round"
          fill="none"
          className="hero-wave-line-b"
        />
        <path
          d="M-80 480 C 260 430, 460 560, 700 440 S 1080 300, 1280 400"
          stroke="url(#heroWaveGradA)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="1"
          className="hero-wave-line-b"
          style={{ animationDelay: '-11s' }}
        />
        <path
          d="M-80 620 C 220 560, 500 700, 760 600 S 1120 500, 1280 580"
          stroke="url(#heroWaveGradC)"
          strokeWidth="1.25"
          strokeLinecap="round"
          fill="none"
          className="hero-wave-line-a-breathe"
          style={{ animationDelay: '-6s' }}
        />
        <path
          d="M-80 40 C 260 100, 480 -40, 740 60 S 1100 140, 1280 60"
          stroke="url(#heroWaveGradC)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="1"
          className="hero-wave-line-b"
          style={{ animationDelay: '-18s' }}
        />
        <path
          d="M-80 720 C 180 660, 340 780, 580 700 S 960 620, 1280 700"
          stroke="url(#heroWaveGradB)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="1"
          className="hero-wave-line-c"
          style={{ animationDelay: '-3s' }}
        />

        {/* TABLET+ additional curves */}
        <g className="hidden sm:block">
          <path
            d="M-80 240 C 220 300, 360 140, 600 220 S 960 300, 1280 220"
            stroke="url(#heroWaveGradC)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="1"
            className="hero-wave-line-d"
            style={{ animationDelay: '-9s' }}
          />
          <path
            d="M-80 560 C 260 620, 420 480, 700 540 S 1060 460, 1280 520"
            stroke="url(#heroWaveGradA)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="1"
            className="hero-wave-line-c-breathe"
            style={{ animationDelay: '-14s' }}
          />
        </g>

        {/* DESKTOP+ additional curves — full density */}
        <g className="hidden lg:block">
          <path
            d="M-80 380 C 160 340, 300 440, 520 380 S 880 320, 1280 360"
            stroke="url(#heroWaveGradB)"
            strokeWidth="0.75"
            strokeLinecap="round"
            fill="none"
            opacity="1"
            className="hero-wave-line-d"
            style={{ animationDelay: '-21s' }}
          />
          <path
            d="M-80 100 C 200 180, 380 20, 640 100 S 1020 200, 1280 120"
            stroke="url(#heroWaveGradA)"
            strokeWidth="0.75"
            strokeLinecap="round"
            fill="none"
            opacity="1"
            className="hero-wave-line-c"
            style={{ animationDelay: '-2s' }}
          />
        </g>

        {/* Soft ambient glows */}
        <circle cx="920" cy="220" r="130" fill="url(#heroWaveGlow)" filter="url(#heroWaveBlur)" className="hero-wave-glow" />
        <circle cx="220" cy="560" r="110" fill="url(#heroWaveGlowAmber)" filter="url(#heroWaveBlur)" className="hero-wave-glow" style={{ animationDelay: '-4s' }} />

        {/* Drifting particles — mobile gets the core set only */}
        {renderParticles(PARTICLES_CORE)}
        <g className="hidden sm:block">{renderParticles(PARTICLES_TABLET)}</g>
        <g className="hidden lg:block">{renderParticles(PARTICLES_DESKTOP)}</g>

        {/* Gentle centered vignette — keeps whichever page content sits on top calm */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#heroWaveFade)" />
      </svg>
    </div>
  );
};

export default HeroWaveField;
