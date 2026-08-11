import React from 'react';

interface AmbientLinesProps {
  corner: 'top-left' | 'bottom-right';
}

const POSITION_CLASSES: Record<AmbientLinesProps['corner'], string> = {
  'top-left': '-top-16 -left-20',
  'bottom-right': '-bottom-16 -right-20',
};

/**
 * Soft, slow-moving background line decoration used to fill otherwise-empty
 * corners of the landing page without competing with content. Indigo-only,
 * low opacity, no fill — purely ambient.
 */
export const AmbientLines: React.FC<AmbientLinesProps> = ({ corner }) => {
  const rotate = corner === 'bottom-right' ? 'rotate-180' : '';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute -z-10 ${POSITION_CLASSES[corner]} w-64 h-64 sm:w-80 sm:h-80 text-indigo-300 ${rotate}`}
    >
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
        <path
          d="M10 150 C 80 60, 160 40, 290 90"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="opacity-30 animate-flow-dash"
        />
        <path
          d="M0 220 C 90 160, 180 210, 300 150"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="opacity-20 animate-flow-dash"
          style={{ animationDelay: '-4s' }}
        />
        <path
          d="M30 40 C 110 95, 150 15, 260 60"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="opacity-20 animate-flow-dash"
          style={{ animationDelay: '-8s' }}
        />
      </svg>
    </div>
  );
};

export default AmbientLines;
