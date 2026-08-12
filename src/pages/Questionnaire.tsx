import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Shield,
  Info,
  RotateCcw,
  Sparkles,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import { BackButton } from '../components/common/BackButton';
import { buildStatementFromAnswers, buildStatementFromTransactions } from '../services/analysisService';

const QUESTION_IDS = [
  'q_income_control',
  'q_money_access',
  'q_pressured_money',
  'q_independent_decisions',
  'q_account_restriction',
  'q_decision_safety',
] as const;

const OPTION_COUNTS: Record<(typeof QUESTION_IDS)[number], number> = {
  q_income_control: 4,
  q_money_access: 4,
  q_pressured_money: 4,
  q_independent_decisions: 4,
  q_account_restriction: 3,
  q_decision_safety: 4,
};

export const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { questionnaireAnswers, setQuestionnaireAnswer, isDemoMode, resetDemo, user, transactions, openAuthModal } =
    useSafeguard();

  const QUESTIONS = QUESTION_IDS.map((id) => ({
    id,
    question: t(`questionnaire.questions.${id}.question`),
    options: Array.from({ length: OPTION_COUNTS[id] }, (_, i) => t(`questionnaire.questions.${id}.options.${i}`)),
  }));

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;
  const selectedOption = currentQuestion ? questionnaireAnswers[currentQuestion.id] || '' : '';

  const handleSelectOption = (option: string) => {
    setQuestionnaireAnswer(currentQuestion.id, option);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      addToast({
        title: t('questionnaire.toast.completedTitle'),
        description: t('questionnaire.toast.completedDesc'),
        type: 'success',
      });
    }
  };

  const handleBack = () => {
    if (isCompleted) {
      setIsCompleted(false);
      setCurrentIndex(totalQuestions - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      // Go back to pattern analysis or financial data
      navigate('/pattern-analysis');
    }
  };

  const handleViewAssessment = () => {
    const statement = buildStatementFromAnswers(
      QUESTIONS.map((q) => ({
        question: q.question,
        answer: questionnaireAnswers[q.id] || '',
      }))
    );

    // Only append financial-data context when the user actually chose to
    // provide it (real upload or sample data) — never fabricate it.
    const fullStatement = isDemoMode
      ? [statement, buildStatementFromTransactions(transactions)].filter(Boolean).join('\n\n')
      : statement;

    if (!fullStatement.trim()) {
      addToast({
        title: t('questionnaire.toast.noResponsesTitle'),
        description: t('questionnaire.toast.noResponsesDesc'),
        type: 'warning',
      });
      return;
    }

    if (!user) {
      addToast({
        title: t('questionnaire.toast.signInTitle'),
        description: t('questionnaire.toast.signInDesc'),
        type: 'warning',
      });
      openAuthModal('login', '/questionnaire');
      return;
    }

    navigate('/results', {
      state: { pendingSubmission: { statement: fullStatement, answers: questionnaireAnswers } },
    });
  };

  const handleReviewAnswers = () => {
    setIsCompleted(false);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-4 sm:py-6">
      <BackButton fallbackPath="/pattern-analysis" />
      {/* TOP HEADER */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
            {t('questionnaire.stepOf', { current: String(currentIndex + 1), total: String(totalQuestions) })}
          </span>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('questionnaire.privateResponse')}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('questionnaire.title')}
        </h1>

        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          {t('questionnaire.subtitle')}
        </p>
      </div>

      {isDemoMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 bg-amber-500/20 rounded-full font-extrabold text-xs uppercase tracking-wider shrink-0">
              {t('questionnaire.demoBadge')}
            </span>
            <span className="text-xs font-medium text-amber-900/90">
              {t('questionnaire.demoDesc')}
            </span>
          </div>
          <button
            onClick={handleViewAssessment}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            <span>{t('questionnaire.skipToResults')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MAIN CARD CONTAINER */}
      {!isCompleted ? (
        <div className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-8 transition-all">
          {/* Question Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{t('questionnaire.questionOf', { current: String(currentIndex + 1), total: String(totalQuestions) })}</span>
              <span className="text-indigo-600 font-extrabold">
                {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Central Question Display */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {currentQuestion.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-4 sm:p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{option}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION NAVIGATION BOTTOM */}
          <div className="pt-6 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="px-5 py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-stone-200 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('questionnaire.back')}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{currentIndex === totalQuestions - 1 ? t('questionnaire.finish') : t('questionnaire.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* AFTER FINAL QUESTION: COMPLETION SCREEN */
        <div className="bg-white border border-stone-200 rounded-[24px] p-8 sm:p-10 shadow-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {t('questionnaire.completeTitle')}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('questionnaire.completeDesc')}
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center space-y-4">
            <button
              onClick={handleViewAssessment}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{t('questionnaire.viewReport')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReviewAnswers}
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium underline flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('questionnaire.reviewAnswers')}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECURITY UX PRIVACY NOTE */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-slate-600 leading-relaxed flex items-start space-x-2.5">
        <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <span>
          {t('questionnaire.privacyNote')}
        </span>
      </div>
    </div>
  );
};

export default Questionnaire;
