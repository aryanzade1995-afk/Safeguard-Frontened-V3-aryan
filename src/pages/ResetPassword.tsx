import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, updatePassword } = useSafeguard();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Unable to reset your password. Please try again.');
      return;
    }

    setDone(true);
    addToast({
      title: 'Password Updated',
      description: 'Your password has been changed. You are now signed in.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-fade-in">
      <div className="relative bg-white rounded-[28px] border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800" />

        <div className="flex items-center space-x-3 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Set a new password</h1>
            <p className="text-xs font-medium text-slate-500">Choose a new password for your Safeguard account</p>
          </div>
        </div>

        {authLoading ? (
          <p className="text-sm text-slate-500">Checking your reset link...</p>
        ) : !isAuthenticated ? (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold leading-relaxed">
              This reset link is invalid or has expired. Please request a new one from the log in screen.
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-stone-200 transition-all cursor-pointer"
            >
              Back to Safeguard
            </button>
          </div>
        ) : done ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Your password has been updated successfully.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Continue to Safeguard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold leading-relaxed animate-fade-in"
              >
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed">At least 6 characters.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Updating...' : 'Update password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-stone-200 flex items-center justify-end text-xs text-slate-500">
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured by Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
