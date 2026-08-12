import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  label?: string;
  /**
   * When true, always navigates to `fallbackPath` instead of using browser
   * history — for pages reachable via multiple different prior routes where
   * Back must deterministically land on one specific page regardless of how
   * the user arrived. Defaults to false (existing history-aware behavior).
   */
  forceFallback?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = '/',
  className = '',
  label,
  forceFallback = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('backButton.label');

  const handleBack = () => {
    if (
      !forceFallback &&
      window.history.state &&
      typeof window.history.state.idx === 'number' &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <div className={`flex items-center justify-start ${className}`}>
      <button
        onClick={handleBack}
        type="button"
        className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-[#FAF9F6] border border-[#EDECE8] hover:border-slate-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-98"
        aria-label={t('backButton.aria')}
      >
        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-transform" />
        <span>{resolvedLabel}</span>
      </button>
    </div>
  );
};
