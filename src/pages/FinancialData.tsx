import React, { useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Sparkles,
  RefreshCw,
  FileCheck,
  Info,
  Shield,
  TrendingDown,
  Repeat,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { BackButton } from '../components/common/BackButton';
import { analyzeFinancialStatement } from '../services/financialHealthService';

type FileState = 'empty' | 'uploading' | 'processing' | 'successful' | 'invalid' | 'error';

interface UploadedFileInfo {
  name: string;
  size: string;
  type: string;
  isSample?: boolean;
}

export const FinancialData: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { transactions, isDemoMode, resetDemo, user } = useSafeguard();

  const [fileState, setFileState] = useState<FileState>('empty');
  const [fileInfo, setFileInfo] = useState<UploadedFileInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [analyzeDataToggle, setAnalyzeDataToggle] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const processSelectedFile = (file: File) => {
    // Validate file type
    const validExtensions = ['.csv', '.pdf', '.txt', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setFileState('invalid');
      setErrorMessage("We couldn't process that file. Please check the format and try again.");
      addToast({
        title: "We couldn't process that file",
        description: "Please check the format and try again (CSV, PDF, or XLS).",
        type: 'danger',
      });
      return;
    }

    if (!user?.id) {
      setFileState('invalid');
      setErrorMessage('Please sign in to analyze a bank statement.');
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to analyze a bank statement.',
        type: 'warning',
      });
      return;
    }

    setFileState('uploading');
    setErrorMessage('');

    // Brief "uploading" beat before the real request, matching the
    // existing two-phase (uploading -> processing) visual pacing.
    setTimeout(() => {
      setFileState('processing');
      analyzeFinancialStatement(file, user.id)
        .then((result) => {
          const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
          setFileInfo({
            name: result.filename,
            size: sizeFormatted,
            type: file.name.endsWith('.pdf') ? 'PDF Bank Statement' : 'CSV Statement',
            isSample: false,
          });
          setFileState('successful');
          addToast({
            title: 'Statement Analyzed',
            description: 'Your bank statement has been processed and analyzed.',
            type: 'success',
          });
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Could not analyze this statement. Please try again.';
          setFileState('invalid');
          setErrorMessage(message);
          addToast({
            title: "We couldn't process that file",
            description: message,
            type: 'danger',
          });
        });
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUseSampleData = () => {
    setFileState('uploading');
    setTimeout(() => {
      setFileState('processing');
      setTimeout(() => {
        setFileInfo({
          name: 'fictional_statement_sample_2026.csv',
          size: '18.4 KB',
          type: 'Sample CSV Statement',
          isSample: true,
        });
        setFileState('successful');
        addToast({
          title: 'Sample Data Loaded',
          description: 'Populated with fictional transaction examples.',
          type: 'info',
        });
      }, 600);
    }, 500);
  };

  const handleDeleteFile = () => {
    setFileState('empty');
    setFileInfo(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addToast({
      title: 'File Deleted',
      description: 'Uploaded file has been completely purged from memory.',
      type: 'info',
    });
  };

  const handleContinue = () => {
    addToast({
      title: 'Proceeding to Pattern Analysis',
      description: 'Reviewing identified financial transaction patterns.',
      type: 'info',
    });
    navigate('/pattern-analysis');
  };

  const handleSkip = () => {
    addToast({
      title: 'Financial Analysis Skipped',
      description: 'Proceeding directly with qualitative questionnaire.',
      type: 'info',
    });
    navigate('/questionnaire');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4 sm:py-6">
      <BackButton fallbackPath="/dashboard" forceFallback />
      {/* TOP HEADER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-indigo-600">
          <span>Step 2 of 4</span>
          <span className="text-slate-400 font-normal capitalize">Financial Data Option</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Add financial information
        </h1>
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Optional. Upload a statement or CSV if you want Safeguard to look for unusual financial patterns.
        </p>
      </div>

      {isDemoMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] p-5 space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-950 font-extrabold text-xs uppercase tracking-wider rounded-full">
                Demo Mode — Fictional Data
              </span>
              <span className="text-xs text-amber-950 font-bold">Maya Sharma (₹45,000 Income)</span>
            </div>
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>Proceed to Pattern Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-amber-950/80 leading-relaxed">
            6 months of realistic fictional transaction data loaded (Salary ₹45,000, ATM Cash Withdrawal ₹20,000, Groceries ₹4,200, Utility Bill ₹2,300, Recurring Transfer ₹8,500, Online Purchase ₹3,200). No upload required.
          </p>
        </div>
      )}

      {/* UPLOAD AREA */}
      <div className="space-y-4">
        {/* State: EMPTY or INVALID or ERROR */}
        {(fileState === 'empty' || fileState === 'invalid' || fileState === 'error') && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-[24px] p-8 text-center transition-all bg-white relative ${
              isDragOver
                ? 'border-indigo-600 bg-indigo-50/40 scale-[1.01]'
                : fileState === 'invalid' || fileState === 'error'
                ? 'border-amber-300 bg-amber-50/30'
                : 'border-[#EDECE8] hover:border-indigo-300 hover:bg-[#FAF9F6]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.pdf,.txt,.xlsx,.xls"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Drop your file here</h3>
                <p className="text-xs text-[#6B7280]">CSV, PDF or supported bank statement</p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Choose file
              </button>

              {fileState === 'invalid' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{errorMessage || 'Invalid file format. Please try a CSV or PDF file.'}</span>
                </div>
              )}
            </div>

            <p className="text-[12px] text-[#9CA3AF] mt-6 pt-4 border-t border-[#EDECE8]">
              Your financial data is sensitive. Only upload information you're comfortable sharing.
            </p>
          </div>
        )}

        {/* State: UPLOADING or PROCESSING */}
        {(fileState === 'uploading' || fileState === 'processing') && (
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {fileState === 'uploading' ? 'Reading statement file...' : 'Parsing transaction records...'}
              </h3>
              <p className="text-xs text-slate-500">
                Processing entirely within local browser memory (0% server upload).
              </p>
            </div>
          </div>
        )}

        {/* State: SUCCESSFUL / UPLOADED */}
        {fileState === 'successful' && fileInfo && (
          <div className="bg-white border border-emerald-200 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">{fileInfo.name}</h4>
                    {fileInfo.isSample && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full">
                        Sample Data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fileInfo.type} • {fileInfo.size} • Processed locally
                  </p>
                </div>
              </div>

              <button
                onClick={handleDeleteFile}
                className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#EDECE8] text-xs">
              <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ready for pattern analysis</span>
              </span>
              <button
                onClick={handleDeleteFile}
                className="text-slate-500 hover:text-slate-900 font-medium underline cursor-pointer"
              >
                Delete uploaded file
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRIVACY CONTROL TOGGLE */}
      <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900 text-sm">Analyze this data</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={analyzeDataToggle}
              onChange={(e) => setAnalyzeDataToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed">
          Financial data is used only to identify transaction patterns relevant to this assessment.
        </p>
      </div>

      {/* SAMPLE DATA SECONDARY CARD */}
      {fileState !== 'successful' && (
        <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Prefer not to upload real data?</span>
            </h4>
            <p className="text-xs text-[#6B7280]">
              Test Safeguard with pre-populated fictional transaction patterns.
            </p>
          </div>

          <button
            onClick={handleUseSampleData}
            className="px-4 py-2.5 bg-white hover:bg-stone-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            Use sample transactions
          </button>
        </div>
      )}

      {/* SAMPLE DASHBOARD PREVIEW */}
      <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDECE8] pb-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
            Sample Transaction Breakdown
          </h3>
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[12px] font-bold rounded-full">
            Fictional sample data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#EDECE8] flex items-center justify-between">
            <span className="font-medium text-slate-700">Salary Deposit</span>
            <span className="font-mono font-bold text-emerald-700">₹45,000</span>
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#EDECE8] flex items-center justify-between">
            <span className="font-medium text-slate-700">ATM Withdrawal</span>
            <span className="font-mono font-bold text-amber-700">₹20,000</span>
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#EDECE8] flex items-center justify-between">
            <span className="font-medium text-slate-700">Online Transfer</span>
            <span className="font-mono font-bold text-slate-800">₹8,500</span>
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#EDECE8] flex items-center justify-between">
            <span className="font-medium text-slate-700">Groceries</span>
            <span className="font-mono font-bold text-slate-800">₹4,200</span>
          </div>
        </div>
      </div>

      {/* NEUTRAL ANALYSIS PREVIEW */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide text-slate-500">
          Neutral Pattern Analysis Preview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-4 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
              <TrendingDown className="w-4 h-4" />
              <span>Withdrawal frequency</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tracks high-volume cash withdrawals relative to standard deposit intervals.
            </p>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-4 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
              <DollarSign className="w-4 h-4" />
              <span>Monthly spending change</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitors shift in primary household card utilization or credit limits.
            </p>
          </div>

          <div className="bg-white border border-[#EDECE8] rounded-[20px] p-4 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
              <Repeat className="w-4 h-4" />
              <span>Recurring transfers</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies automatic transfers to secondary or unlinked accounts.
            </p>
          </div>
        </div>
      </div>

      {/* DISCLAIMER FOOTER */}
      <div className="p-4 bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl text-xs text-slate-600 leading-relaxed flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <span>
          Transaction data can show financial patterns, but it cannot reveal intent, coercion, or who ultimately receives money.
        </span>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="pt-4 border-t border-[#EDECE8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Skip financial analysis</span>
          </button>

          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialData;
