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
import { BackButton } from '../components/common/BackButton';

export const Assessment: React.FC = () => {
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
        title: 'Redirecting to Statement Upload',
        description: 'You can upload CSV or bank statement records privately.',
        type: 'info',
      });
      navigate('/financial-data');
    } else if (choice === 'sample') {
      startDemo();
      addToast({
        title: 'Sample Data Loaded',
        description: 'Continuing with fictional transactions for demonstration.',
        type: 'info',
      });
      navigate('/pattern-analysis');
    } else {
      // skip
      addToast({
        title: 'Questions Only Mode',
        description: 'Proceeding directly to the autonomy questions.',
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
        <BackButton fallbackPath="/" />
      </div>

      {/* Main Centered Container */}
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
            Step {assessmentStep} of 2
          </span>
          <span className="text-xs text-slate-400">
            {assessmentStep === 1 && 'Consent & Overview'}
            {assessmentStep === 2 && 'Data Choice'}
          </span>
        </div>

        {/* ================= STEP 1: BEFORE WE BEGIN / CONSENT ================= */}
        {assessmentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Before we begin</h1>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Safeguard uses optional financial information and your answers to identify patterns that may be relevant to financial autonomy.
              </p>
            </div>

            {/* Prominent Privacy Card */}
            <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Your control comes first</h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Financial data is optional</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>You choose what to share</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>You can stop at any time</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>You can delete your information</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Results are informational, not diagnostic</span>
                </li>
              </ul>
            </div>

            {/* Consent Section */}
            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-[24px] p-6 space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Consent & Acknowledgement
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
                    I understand how my information may be used for this assessment.
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
                    I understand that Safeguard cannot determine whether financial abuse has occurred from financial data alone.
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
                <span>Continue</span>
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
                How would you like to continue?
              </h1>
              <p className="text-sm text-[#6B7280]">
                Select how you want to evaluate your financial autonomy.
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
                    Upload financial data
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    I have a bank statement or CSV I'd like to analyze.
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
                    Use sample data
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    I want to explore the prototype with fictional transactions.
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
                    Skip financial data
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    I'd prefer to answer questions only.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all self-center" />
              </button>
            </div>

            {/* Small reassurance note */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>You can complete the assessment without sharing any financial data.</span>
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setAssessmentStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to consent</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
