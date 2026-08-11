import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export interface AIInsightProps {
  /** Observed financial pattern string */
  pattern?: string;
  /** User provided questionnaire/context string */
  context?: string;
  /** Objective summary/interpretation */
  interpretation?: string;
  /** Explicit limitation disclaimer */
  limitation?: string;
  /** Level of pattern confidence detected in data */
  patternConfidence?: 'High' | 'Medium' | 'Low' | string;
  /** Detailed rationale for why this confidence level was assigned */
  confidenceExplanation?: string;
  /** Custom rationale for "Why am I seeing this?" */
  whyAmISeeingThis?: string;
  /** Custom rationale for "What does this data not tell me?" */
  whatDataDoesNotTellMe?: string;
  /** Initial loading state or externally controlled loading state */
  isLoading?: boolean;
  /** Optional custom class names */
  className?: string;
  /** Allow simulating or re-triggering AI organizing process */
  onRefresh?: () => void;
}

export const AIInsight: React.FC<AIInsightProps> = ({
  pattern = 'ATM withdrawals increased significantly over the last three months.',
  context = 'You also indicated that you sometimes have limited access to money.',
  interpretation = 'Together, these signals may be worth reviewing as part of your financial autonomy.',
  limitation = 'These signals cannot establish intent, coercion or financial abuse.',
  patternConfidence = 'High',
  confidenceExplanation = 'The transaction pattern is clearly present in the supplied data.',
  whyAmISeeingThis = 'Safeguard synthesizes transaction frequency shifts detected in your uploaded bank files with your voluntary questionnaire responses to highlight points for personal reflection.',
  whatDataDoesNotTellMe = 'Transaction lists alone cannot explain personal arrangements, shared household agreements, or underlying motivations. Only you can judge the context behind your finances.',
  isLoading: initialLoading = false,
  className = '',
  onRefresh,
}) => {
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isWhatDataNotOpen, setIsWhatDataNotOpen] = useState(false);
  const [loading, setLoading] = useState(initialLoading);

  const handleSimulateRefresh = () => {
    setLoading(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  const confidenceColorClasses = {
    High: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-slate-50 text-slate-700 border-slate-200',
  }[patternConfidence] || 'bg-indigo-50 text-indigo-800 border-indigo-200';

  return (
    <div
      className={`bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden transition-all ${className}`}
    >
      {/* Top accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDECE8] pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] font-extrabold uppercase tracking-wider text-indigo-700 block">
              AI-assisted insight
            </span>
            <p className="text-[12px] text-slate-500">
              AI is organizing the information you provided.
            </p>
          </div>
        </div>

        {/* PATTERN CONFIDENCE VISUALIZATION */}
        <div className="flex items-center space-x-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${confidenceColorClasses}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>Pattern confidence — {patternConfidence}</span>
            
            <Tooltip
              position="bottom"
              content={
                <div className="max-w-xs text-left space-y-1 p-1">
                  <p className="font-bold text-white text-xs">Pattern Confidence Info</p>
                  <p className="text-[12px] text-slate-200 leading-normal whitespace-normal">
                    {confidenceExplanation}
                  </p>
                  <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-700 whitespace-normal">
                    This measures statistical frequency in uploaded statements. It does NOT mean high probability of abuse.
                  </p>
                </div>
              }
            >
              <button
                type="button"
                className="ml-1 text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer focus:outline-hidden"
                aria-label="Confidence tooltip"
              >
                <HelpCircle className="w-3.5 h-3.5 inline" />
              </button>
            </Tooltip>
          </div>

          <button
            onClick={handleSimulateRefresh}
            disabled={loading}
            title="Refresh insights"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* LOADING STATE OR CONTENT */}
      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-3 text-center animate-fade-in">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Reviewing selected information...</h4>
            <p className="text-xs text-slate-500">
              AI is organizing the information you provided.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* MAIN STRUCTURED CONTENT GRID */}
          <div className="space-y-4">
            {/* 1. Pattern */}
            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                Observed Pattern
              </span>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                "{pattern}"
              </p>
            </div>

            {/* 2. Context */}
            {context && (
              <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  User Context Connected
                </span>
                <p className="text-sm text-slate-800 leading-snug font-medium">
                  "{context}"
                </p>
              </div>
            )}

            {/* 3. Interpretation */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                Synthesis & Reflection
              </span>
              <p className="text-sm text-indigo-950 font-semibold leading-relaxed">
                {interpretation}
              </p>
            </div>

            {/* 4. Limitation */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed font-medium">
                <span className="font-bold text-slate-800">Limitation: </span>
                {limitation}
              </div>
            </div>
          </div>

          {/* EXPANDABLE SECTIONS */}
          <div className="border-t border-[#EDECE8] pt-4 space-y-3">
            {/* Expandable 1: Why am I seeing this? */}
            <div className="border border-[#EDECE8] rounded-2xl overflow-hidden bg-[#FAF9F6]">
              <button
                type="button"
                onClick={() => setIsWhyOpen(!isWhyOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-stone-100 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>Why am I seeing this?</span>
                </div>
                {isWhyOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isWhyOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-[#EDECE8] bg-white animate-fade-in">
                  <p>{whyAmISeeingThis}</p>
                </div>
              )}
            </div>

            {/* Expandable 2: What does this data not tell me? */}
            <div className="border border-[#EDECE8] rounded-2xl overflow-hidden bg-[#FAF9F6]">
              <button
                type="button"
                onClick={() => setIsWhatDataNotOpen(!isWhatDataNotOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-stone-100 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>What does this data not tell me?</span>
                </div>
                {isWhatDataNotOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isWhatDataNotOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-[#EDECE8] bg-white animate-fade-in">
                  <p>{whatDataDoesNotTellMe}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsight;
