import React, { useEffect } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useSafeguard } from '../../context/SafeguardContext';

export const QuickExitButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { triggerQuickExit } = useSafeguard();

  // Double ESC key shortcut for quick exit
  useEffect(() => {
    let escCount = 0;
    let timer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escCount++;
        if (escCount >= 2) {
          triggerQuickExit();
        } else {
          timer = setTimeout(() => {
            escCount = 0;
          }, 1000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [triggerQuickExit]);

  return (
    <button
      onClick={triggerQuickExit}
      title="Quick Exit (Press ESC twice) - Instantly leaves page"
      aria-label="Quick Exit - Instantly leaves this website"
      className={`inline-flex items-center justify-center font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-150 shadow-sm border border-red-700 active:scale-95 ${
        compact ? 'px-3 py-1.5 text-xs gap-1.5' : 'px-4 py-2 text-xs md:text-sm gap-2'
      }`}
    >
      <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
      <span>Quick Exit</span>
      <span className="hidden sm:inline-block text-[11px] bg-red-800/80 px-1.5 py-0.5 rounded text-red-100 font-mono">
        ESC x2
      </span>
    </button>
  );
};
