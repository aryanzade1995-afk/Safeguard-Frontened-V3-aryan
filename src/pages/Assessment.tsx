import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Sparkles,
  FileText,
  ArrowRight,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import { BackButton } from '../components/common/BackButton';

export const Assessment: React.FC = () => {
  const { t } = useTranslation();
  // Step 1 = Onboarding & Consent, Step 2 = Data Choice
  const [assessmentStep, setAssessmentStep] = useState<number>(1);

  // Consent checkboxes state
  const [consentUsed, setConsentUsed] = useState<boolean>(false);
  const [consentNonDiagnostic, setConsentNonDiagnostic] = useState<boolean>(false);

  const { startDemo } = useSafeguard();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isConsentAccepted = consentUsed && consentNonDiagnostic;

  const handleConsentContinue = () => {
    if (!isConsentAccepted) return;
    setAssessmentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDataChoiceSelect = (choice: 'upload' | 'sample' | 'skip') => {
    if (choice === 'upload') {
      addToast({
        title: t('assessment.toast.uploadTitle'),
        description: t('assessment.toast.uploadDesc'),
        type: 'info',
      });
      navigate('/financial-data');
    } else if (choice === 'sample') {
      startDemo();
      addToast({
        title: t('assessment.toast.sampleTitle'),
        description: t('assessment.toast.sampleDesc'),
        type: 'info',
      });
      navigate('/pattern-analysis');
    } else {
      // skip
      addToast({
        title: t('assessment.toast.skipTitle'),
        description: t('assessment.toast.skipDesc'),
        type: 'info',
      });
      navigate('/questionnaire');
    }
  };

  return (
    <div className="py-4 sm:py-6">
      {/* Back only — the global navbar already provides Safeguard branding,
          so no second logo header here. */}
      <div className="max-w-3xl mx-auto pb-6 border-b border-[#EDECE8] mb-8">
        <BackButton fallbackPath="/dashboard" forceFallback />
      </div>

      {/* Main Centered Container */}
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
            {t('assessment.stepOf', { step: String(assessmentStep) })}
          </span>
          <span className="text-xs text-slate-400">
            {assessmentStep === 1 && t('assessment.step1Label')}
            {assessmentStep === 2 && t('assessment.step2Label')}
          </span>
        </div>

        {/* ================= STEP 1: BEFORE WE BEGIN / CONSENT ================= */}
        {assessmentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">{t('assessment.step1.title')}</h1>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {t('assessment.step1.subtitle')}
              </p>
            </div>

            {/* Prominent Privacy Card */}
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">{t('assessment.step1.controlTitle')}</h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                {(['0', '1', '2', '3', '4'] as const).map((i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t(`assessment.step1.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consent Section */}
            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-[24px] p-6 space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                {t('assessment.step1.consentTitle')}
              </h4>

              <div className="space-y-3">
                {/* Checkbox 1 */}
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentUsed}
                    onChange={(e) => setConsentUsed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug group-hover:text-slate-900">
                    {t('assessment.step1.consent1')}
                  </span>
                </label>

                {/* Checkbox 2 */}
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentNonDiagnostic}
                    onChange={(e) => setConsentNonDiagnostic(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug group-hover:text-slate-900">
                    {t('assessment.step1.consent2')}
                  </span>
                </label>
              </div>
            </div>

            {/* CTA Continue */}
            <div>
              <button
                onClick={handleConsentContinue}
                disabled={!isConsentAccepted}
                className={`w-full py-4 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  isConsentAccepted
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-[0.99] cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>{t('assessment.step1.continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DATA CHOICE ================= */}
        {assessmentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                {t('assessment.step2.title')}
              </h1>
              <p className="text-sm text-[#6B7280]">
                {t('assessment.step2.subtitle')}
              </p>
            </div>

            {/* Three Elegant Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Card 1: Upload financial data */}
              <button
                onClick={() => handleDataChoiceSelect('upload')}
                className="w-full text-left bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer flex items-start space-x-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {t('assessment.step2.upload.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {t('assessment.step2.upload.desc')}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all self-center" />
              </button>

              {/* Card 2: Use sample data */}
              <button
                onClick={() => handleDataChoiceSelect('sample')}
                className="w-full text-left bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer flex items-start space-x-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {t('assessment.step2.sample.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {t('assessment.step2.sample.desc')}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all self-center" />
              </button>

              {/* Card 3: Skip financial data */}
              <button
                onClick={() => handleDataChoiceSelect('skip')}
                className="w-full text-left bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer flex items-start space-x-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {t('assessment.step2.skip.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {t('assessment.step2.skip.desc')}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all self-center" />
              </button>
            </div>

            {/* Small reassurance note */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{t('assessment.step2.reassurance')}</span>
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setAssessmentStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('assessment.step2.backToConsent')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
