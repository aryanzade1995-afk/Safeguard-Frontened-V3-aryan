import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  MailCheck,
  User as UserIcon,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useSafeguard } from '../../context/SafeguardContext';
import { useToast } from '../../context/ToastContext';
import { GoogleIcon } from './GoogleIcon';

type ModalMode = 'auth' | 'forgotPassword' | 'forgotPasswordSent' | 'confirmEmailSent';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    closeAuthModal,
    authModalTab,
    signUpWithPassword,
    signInWithPassword,
    signInWithGoogle,
    requestPasswordReset,
    authRedirectTarget,
  } = useSafeguard();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalTab || 'login');
  const [mode, setMode] = useState<ModalMode>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setActiveTab(authModalTab || 'login');
    setMode('auth');
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
  }, [authModalTab, showAuthModal]);

  if (!showAuthModal) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res =
      activeTab === 'signup'
        ? await signUpWithPassword(email, password, name)
        : await signInWithPassword(email, password);

    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Something went wrong. Please try again.');
      return;
    }

    if (res.needsEmailConfirmation) {
      setMode('confirmEmailSent');
      return;
    }

    addToast({
      title: activeTab === 'signup' ? 'Account Created' : 'Welcome Back',
      description: 'You are now signed in.',
      type: 'success',
    });
    closeAuthModal();
    navigate(authRedirectTarget || '/dashboard');
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      setErrorMessage(res.error || 'Unable to start Google sign-in. Please try again.');
    }
    // On success the browser is navigating away to Google — leave the
    // loading state on so the button doesn't flicker before the redirect.
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Unable to send a reset link. Please try again.');
      return;
    }
    setMode('forgotPasswordSent');
  };

  const backToLogin = () => {
    setMode('auth');
    setActiveTab('login');
    setErrorMessage('');
  };

  const headerIcon =
    mode === 'forgotPassword' ? (
      <KeyRound className="w-5 h-5" />
    ) : mode === 'forgotPasswordSent' || mode === 'confirmEmailSent' ? (
      <MailCheck className="w-5 h-5" />
    ) : (
      <Lock className="w-5 h-5" />
    );

  const headerTitle =
    mode === 'forgotPassword'
      ? 'Reset your password'
      : mode === 'forgotPasswordSent'
      ? 'Check your email'
      : mode === 'confirmEmailSent'
      ? 'Confirm your email'
      : activeTab === 'login'
      ? 'Log in to Safeguard'
      : 'Create an Account';

  const headerSubtitle =
    mode === 'forgotPassword'
      ? "We'll email you a link to reset your password."
      : mode === 'forgotPasswordSent'
      ? `A reset link was sent to ${email.trim()} if an account exists.`
      : mode === 'confirmEmailSent'
      ? `Click the link we sent to ${email.trim()} to activate your account.`
      : activeTab === 'login'
      ? 'Access your private account & financial dashboard'
      : 'Start your confidential financial autonomy journey';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[28px] border border-[#EDECE8] shadow-2xl z-10 overflow-hidden transform transition-all animate-scale-up space-y-6 p-6 sm:p-8">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="flex items-start justify-between pt-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              {headerIcon}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{headerTitle}</h3>
              <p className="text-xs font-medium text-slate-500">{headerSubtitle}</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'auth' && (
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-950 shadow-xs border border-stone-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage('');
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-indigo-950 shadow-xs border border-stone-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign up
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold leading-relaxed animate-fade-in"
          >
            {errorMessage}
          </div>
        )}

        {mode === 'confirmEmailSent' || mode === 'forgotPasswordSent' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Didn't get the email? Check your spam folder, or try again in a few minutes.
            </p>
            <button
              type="button"
              onClick={backToLogin}
              className="w-full py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to log in</span>
            </button>
          </div>
        ) : mode === 'forgotPassword' ? (
          <form onSubmit={handleSendResetLink} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Sending link...' : 'Send reset link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={backToLogin}
              className="w-full text-xs text-slate-500 hover:text-slate-700 font-bold flex items-center justify-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to log in</span>
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Maya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgotPassword');
                        setErrorMessage('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
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
                {activeTab === 'signup' && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">At least 6 characters.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : activeTab === 'login'
                    ? 'Log in to Account'
                    : 'Create Confidential Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center space-x-3">
              <div className="h-px flex-1 bg-[#EDECE8]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-[#EDECE8]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-sm rounded-xl border border-[#EDECE8] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2.5 disabled:opacity-60 shadow-xs"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
            </button>
          </>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#EDECE8] flex items-center justify-end text-xs text-slate-500">
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured by Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
