import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Shield,
  FileText,
  KeyRound,
  Eye,
  History,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { BackButton } from '../components/common/BackButton';

type DeletionType = 'financial' | 'questionnaire' | 'all' | null;

interface ConsentLog {
  id: string;
  category: string;
  status: 'Active' | 'Withdrawn';
  date: string;
}

export const PrivacyCenter: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    transactions,
    questionnaireAnswers,
    wipeAllData,
    clearFinancialData,
    clearQuestionnaireData,
  } = useSafeguard();

  // Confirmation Modal state
  const [deletionType, setDeletionType] = useState<DeletionType>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Consent log state
  const [consentList, setConsentList] = useState<ConsentLog[]>([
    {
      id: 'c-1',
      category: 'Optional Financial Statement Analysis',
      status: 'Active',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      id: 'c-2',
      category: 'Private Reflection Questionnaire',
      status: 'Active',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      id: 'c-3',
      category: 'Local Session Storage Preference',
      status: 'Active',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  ]);

  const handleOpenDeleteModal = (type: DeletionType) => {
    setDeletionType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDeletion = () => {
    if (deletionType === 'financial') {
      clearFinancialData();
      addToast({
        title: 'Financial Data Deleted',
        description: 'Statement uploads and extracted transactions removed from local storage.',
        type: 'info',
      });
    } else if (deletionType === 'questionnaire') {
      clearQuestionnaireData();
      addToast({
        title: 'Responses Deleted',
        description: 'All questionnaire answers cleared from local memory.',
        type: 'info',
      });
    } else if (deletionType === 'all') {
      wipeAllData();
      addToast({
        title: 'All Assessment Data Erased',
        description: 'Session reset completely to clean state.',
        type: 'info',
      });
    }
    setIsModalOpen(false);
    setDeletionType(null);
  };

  const handleWithdrawConsent = (id: string) => {
    setConsentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Withdrawn' } : item))
    );
    addToast({
      title: 'Consent Withdrawn',
      description: 'Updated privacy consent record for this data category.',
      type: 'info',
    });
  };

  const hasFinancialData = transactions.length > 0;
  const hasQuestionnaireData = Object.keys(questionnaireAnswers).length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-4 sm:py-6">
      {/* HEADER */}
      <div className="space-y-3 border-b border-[#EDECE8] pb-6">
        <div className="flex items-center justify-between">
          <BackButton fallbackPath="/settings" label="Back to Settings" />
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
            Verified Local Privacy
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
          Privacy center
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
          Understand and control what Safeguard stores and uses.
        </p>
      </div>

      {/* STATUS STRIP */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#EDECE8] rounded-full text-xs font-bold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Financial data — Optional</span>
        </span>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#EDECE8] rounded-full text-xs font-bold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Questionnaire — Voluntary</span>
        </span>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#EDECE8] rounded-full text-xs font-bold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Data sharing — Controlled</span>
        </span>
      </div>

      {/* PRIVACY STATUS CARD */}
      <div className="bg-white border border-[#EDECE8] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#EDECE8] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A1A]">Your privacy status</h2>
              <p className="text-xs text-slate-500">Current session data footprint overview</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
            Local Session
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Financial data
            </span>
            <div className="text-sm font-extrabold text-slate-900">
              {hasFinancialData ? 'Uploaded' : 'Optional'}
            </div>
            <span className="text-[11px] text-slate-500">In-memory parsing</span>
          </div>

          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Questionnaire
            </span>
            <div className="text-sm font-extrabold text-slate-900">
              {hasQuestionnaireData ? 'Completed' : 'Provided voluntarily'}
            </div>
            <span className="text-[11px] text-slate-500">Unidentifiable choices</span>
          </div>

          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Account info
            </span>
            <div className="text-sm font-extrabold text-slate-900">Minimal</div>
            <span className="text-[11px] text-slate-500">No account required</span>
          </div>

          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Data sharing
            </span>
            <div className="text-sm font-extrabold text-emerald-700">None</div>
            <span className="text-[11px] text-emerald-800 font-medium">0% external telemetry</span>
          </div>
        </div>
      </div>

      {/* DATA CONTROL SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">Data Control & Granular Deletion</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Instantly purge individual data categories without affecting the rest of your session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial data control */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Financial data</span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Manage the financial files associated with your assessment.
              </p>
            </div>

            <button
              onClick={() => handleOpenDeleteModal('financial')}
              disabled={!hasFinancialData}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                hasFinancialData
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  : 'bg-stone-100 text-slate-400 border border-stone-200 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete financial data</span>
            </button>
          </div>

          {/* Assessment responses control */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Assessment responses</span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Remove your questionnaire responses from local memory.
              </p>
            </div>

            <button
              onClick={() => handleOpenDeleteModal('questionnaire')}
              disabled={!hasQuestionnaireData}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                hasQuestionnaireData
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  : 'bg-stone-100 text-slate-400 border border-stone-200 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete responses</span>
            </button>
          </div>

          {/* Complete assessment control */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Complete assessment</span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Erase all local transactions, responses, and score states at once.
              </p>
            </div>

            <button
              onClick={() => handleOpenDeleteModal('all')}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete all assessment data</span>
            </button>
          </div>
        </div>
      </div>

      {/* DATA TRANSPARENCY: WHAT WE USE vs WHAT WE DON'T NEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT WE USE */}
        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>What we use</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-center space-x-2 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#EDECE8]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">Transaction patterns</span>
              <span className="text-[11px] text-slate-400 ml-auto">Optionally parsed locally</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#EDECE8]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">Questionnaire responses</span>
              <span className="text-[11px] text-slate-400 ml-auto">Stored in browser state</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#EDECE8]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">Assessment preferences</span>
              <span className="text-[11px] text-slate-400 ml-auto">Quick exit & disguise settings</span>
            </li>
          </ul>
        </div>

        {/* WHAT WE DON'T NEED */}
        <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
            <XCircle className="w-5 h-5 text-slate-400" />
            <span>What we don't need</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-center space-x-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-600">Passwords or bank login credentials</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-600">Card PINs or security codes</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-600">One-Time Passwords (OTPs)</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-600">Unnecessary identity information</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SECURITY PRINCIPLES */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">Security principles</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Transparent breakdown of active client architecture and production roadmap status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Encrypted communication</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                Active (HTTPS)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transport-layer encryption for all external web assets and assets load.
            </p>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Secure authentication</span>
              <span className="px-2 py-0.5 bg-stone-100 text-slate-600 text-[11px] font-bold rounded-full border border-stone-200">
                Planned for production
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Optional zero-knowledge encrypted vault accounts planned for multi-device sync.
            </p>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Limited data collection</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Data minimization enforced at design level; zero unnecessary fields requested.
            </p>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Session protection</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Local memory auto-clear on Quick Exit and browser window close options.
            </p>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Auditability</span>
              <span className="px-2 py-0.5 bg-stone-100 text-slate-600 text-[11px] font-bold rounded-full border border-stone-200">
                Planned for production
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open specification export format to allow independent verification of memory purges.
            </p>
          </div>
        </div>
      </div>

      {/* CONSENT HISTORY */}
      <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDECE8] pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Your consent</h3>
          </div>
          <span className="text-xs text-slate-400">Recorded locally</span>
        </div>

        <div className="space-y-3">
          {consentList.map((c) => (
            <div
              key={c.id}
              className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#EDECE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 block">{c.category}</span>
                <span className="text-[11px] text-slate-500">Granted: {c.date}</span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                    c.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-stone-200 text-slate-600'
                  }`}
                >
                  {c.status}
                </span>

                {c.status === 'Active' && (
                  <button
                    onClick={() => handleWithdrawConsent(c.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                  >
                    Withdraw consent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER QUOTE */}
      <div className="p-6 bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl text-center">
        <p className="text-sm font-semibold text-slate-700 italic">
          "Privacy should be understandable, not hidden in legal language."
        </p>
      </div>

      {/* CONFIRMATION DELETION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Data Erasure"
        description="This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            {deletionType === 'financial' &&
              'Are you sure you want to delete all uploaded bank statements and parsed financial transactions?'}
            {deletionType === 'questionnaire' &&
              'Are you sure you want to clear your private questionnaire reflection responses?'}
            {deletionType === 'all' &&
              'Are you sure you want to completely wipe all local financial entries, survey answers, and assessment preferences?'}
          </p>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDeletion}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacyCenter;
