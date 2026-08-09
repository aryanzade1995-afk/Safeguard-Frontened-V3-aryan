import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  LogOut,
  Bell,
  Globe,
  SunMedium,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  KeyRound,
  Laptop,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Sliders,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Modal } from '../components/ui/Modal';
import { useSafeguard } from '../context/SafeguardContext';
import { useToast } from '../context/ToastContext';
import { BackButton } from '../components/common/BackButton';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    wipeAllData,
    discreetMode,
    toggleDiscreetMode,
    user,
    updateFullName,
    logout,
    signOutEverywhere,
    signInWithPassword,
    updatePassword,
  } = useSafeguard();
  const { addToast } = useToast();

  // Account state — sourced from the authenticated Supabase user / profiles row.
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    setNameDraft(user?.name || '');
  }, [user?.name]);

  // Change password modal state (only applicable to email/password accounts)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences state
  const [notifications, setNotifications] = useState({
    emailUpdates: false,
    sessionReminders: true,
    inAppAlerts: true,
  });
  const [language, setLanguage] = useState('English (US)');
  const [appearance, setAppearance] = useState('Light Warm');

  // Privacy state
  const [exitUrl, setExitUrl] = useState(settings.quickExitUrl);
  const [autoClear, setAutoClear] = useState(settings.autoClearOnExit);

  // Modals state
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeleteDataModalOpen, setIsDeleteDataModalOpen] = useState(false);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    const res = await updateFullName(nameDraft);
    setSavingAccount(false);

    if (!res.success) {
      addToast({
        title: 'Update Failed',
        description: res.error || 'Could not update your profile. Please try again.',
        type: 'warning',
      });
      return;
    }

    setIsEditingAccount(false);
    addToast({
      title: 'Account Information Updated',
      description: 'Your profile name has been saved.',
      type: 'success',
    });
  };

  const handleSignOut = async () => {
    await logout();
    addToast({
      title: 'Signed Out',
      description: 'You have been signed out.',
      type: 'info',
    });
    navigate('/');
  };

  const handleSignOutAllDevices = async () => {
    const res = await signOutEverywhere();
    if (!res.success) {
      addToast({
        title: 'Could Not Sign Out Everywhere',
        description: res.error || 'Please try again.',
        type: 'warning',
      });
      return;
    }
    addToast({
      title: 'Signed Out of All Devices',
      description: 'All active sessions, including this one, have been invalidated.',
      type: 'info',
    });
    navigate('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      addToast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure new password and confirmation match.',
        type: 'warning',
      });
      return;
    }
    if (!user?.email) return;

    setChangingPassword(true);

    // Re-verify the current password before allowing the change.
    const verifyRes = await signInWithPassword(user.email, currentPass);
    if (!verifyRes.success) {
      setChangingPassword(false);
      addToast({
        title: 'Current Password Incorrect',
        description: verifyRes.error || 'Please try again.',
        type: 'warning',
      });
      return;
    }

    const updateRes = await updatePassword(newPass);
    setChangingPassword(false);

    if (!updateRes.success) {
      addToast({
        title: 'Update Failed',
        description: updateRes.error || 'Could not update your password. Please try again.',
        type: 'warning',
      });
      return;
    }

    setIsChangePasswordModalOpen(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    addToast({
      title: 'Password Updated',
      description: 'Your password has been successfully changed.',
      type: 'success',
    });
  };

  const handleSaveExitSettings = () => {
    updateSettings({
      quickExitUrl: exitUrl,
      autoClearOnExit: autoClear,
    });
    addToast({
      title: 'Privacy & Quick Exit Settings Updated',
      description: 'Saved into local preferences.',
      type: 'success',
    });
  };

  const handleDeleteDataOnly = () => {
    wipeAllData();
    setIsDeleteDataModalOpen(false);
    addToast({
      title: 'Assessment Data Deleted',
      description: 'All local responses and financial uploads have been purged.',
      type: 'info',
    });
  };

  const handleDeleteAccountConfirmed = async () => {
    wipeAllData();
    await logout();
    setIsDeleteAccountModalOpen(false);
    addToast({
      title: 'Local Data Cleared & Signed Out',
      description:
        'Your local assessment data was removed and you were signed out. Contact support to permanently delete your account record.',
      type: 'info',
    });
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-4 sm:py-6">
      <BackButton fallbackPath="/" />
      {/* Header */}
      <div className="border-b border-[#EDECE8] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280]">
          Manage your account, preferences, privacy controls, and security options.
        </p>
      </div>

      {/* 1. ACCOUNT SECTION */}
      <section className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#EDECE8] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1A1A1A]">ACCOUNT</h2>
              <p className="text-xs text-[#6B7280]">Account details linked to your Supabase sign-in</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingAccount(!isEditingAccount)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            {isEditingAccount ? 'Cancel' : 'Edit details'}
          </button>
        </div>

        {isEditingAccount ? (
          <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
            <Input
              label="Full name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email is tied to your sign-in and can't be changed here."
            />
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                disabled={savingAccount}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {savingAccount ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingAccount(false);
                  setNameDraft(user?.name || '');
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Name
              </span>
              <div className="text-sm font-bold text-slate-900">{user?.name || '—'}</div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Email
              </span>
              <div className="text-sm font-bold text-slate-900 truncate">{user?.email || '—'}</div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verification
              </span>
              {!user ? (
                <div className="text-sm font-bold text-slate-400">Not signed in</div>
              ) : user.emailConfirmed ? (
                <div className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email verified</span>
                </div>
              ) : (
                <div className="text-sm font-bold text-amber-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending verification</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-[#EDECE8] text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. PREFERENCES SECTION */}
      <section className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-[#EDECE8] pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1A1A1A]">PREFERENCES</h2>
            <p className="text-xs text-[#6B7280]">Notification settings, language, and display style</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Notification preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3.5 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailUpdates}
                  onChange={(e) =>
                    setNotifications({ ...notifications, emailUpdates: e.target.checked })
                  }
                  className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">Email updates</span>
              </label>

              <label className="p-3.5 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sessionReminders}
                  onChange={(e) =>
                    setNotifications({ ...notifications, sessionReminders: e.target.checked })
                  }
                  className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">Session reminders</span>
              </label>

              <label className="p-3.5 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.inAppAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, inAppAlerts: e.target.checked })
                  }
                  className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">In-app alerts</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Español">Español</option>
                <option value="Français">Français</option>
              </select>
            </div>

            {/* Appearance */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <SunMedium className="w-4 h-4 text-indigo-600" />
                <span>Appearance</span>
              </label>
              <select
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EDECE8] rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Light Warm">Light Warm (Editorial Neutral)</option>
                <option value="System Default">System Default</option>
                <option value="Soft Dark">Soft Dark (Eye-Safe)</option>
              </select>
            </div>
          </div>

          {/* Discreet Disguise Mode */}
          <div className="pt-2 border-t border-[#EDECE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Discreet Disguise Mode</h4>
              <p className="text-[11px] text-slate-500">
                Replaces app logo and title in navigation with generic "Personal Ledger"
              </p>
            </div>
            <button
              onClick={toggleDiscreetMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                discreetMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-800 border border-stone-200'
              }`}
            >
              {discreetMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{discreetMode ? 'Restore Safeguard Logo' : 'Enable Header Disguise'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. PRIVACY SECTION */}
      <section className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-[#EDECE8] pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1A1A1A]">PRIVACY</h2>
            <p className="text-xs text-[#6B7280]">Access Privacy Center and granular local data controls</p>
          </div>
        </div>

        {/* Featured Privacy Center Link Card */}
        <NavLink to="/settings/privacy" className="block group">
          <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between border border-indigo-800">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors">
                  Privacy Center
                </h3>
                <p className="text-xs text-indigo-200/80">
                  Understand and control what Safeguard stores, uses, and purges.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300 group-hover:translate-x-1 transition-transform shrink-0 ml-3">
              <span>Open Privacy Center</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </NavLink>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Data permissions */}
          <div className="space-y-3 bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Data permissions
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">In-memory local parsing</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                  Granted
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Bank statement files are read entirely within browser memory and never uploaded to cloud servers.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#EDECE8]">
                <span className="font-bold text-slate-800">Private Reflection Storage</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                  Local Session
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Questionnaire responses are stored locally in your browser's private memory state.
              </p>
            </div>
          </div>

          {/* Delete data */}
          <div className="space-y-3 bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Delete data
              </h3>
              <p className="text-xs text-slate-700 font-medium">
                Clear all questionnaire responses, statement logs, and result summaries instantly.
              </p>
            </div>

            <button
              onClick={() => setIsDeleteDataModalOpen(true)}
              className="py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs mt-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete assessment data</span>
            </button>
          </div>
        </div>

        {/* Quick Exit URL Preferences */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Quick Exit Redirect URL</span>
            <span className="text-[10px] text-slate-400">Esc x 2 or button click</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={exitUrl}
              onChange={(e) => setExitUrl(e.target.value)}
              placeholder="https://www.weather.com"
              className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSaveExitSettings}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Save URL
            </button>
          </div>
        </div>
      </section>

      {/* 4. SECURITY SECTION */}
      <section className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-[#EDECE8] pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1A1A1A]">SECURITY</h2>
            <p className="text-xs text-[#6B7280]">Sign-in method, active sessions, and multi-device sign out</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sign-in method card */}
          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Sign-in method</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {!user
                  ? 'Sign in to see how you access your account.'
                  : user.hasPasswordAuth
                  ? 'Update your account password regularly to keep access safe.'
                  : "You're signed in with Google — there's no password to manage."}
              </p>
            </div>

            {user?.hasPasswordAuth ? (
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="py-2 px-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all cursor-pointer shadow-xs w-fit"
              >
                Update password
              </button>
            ) : user ? (
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold inline-block w-fit">
                Google sign-in
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 bg-stone-100 px-2 py-0.5 rounded-full font-bold inline-block w-fit">
                Not signed in
              </span>
            )}
          </div>

          {/* Active sessions card */}
          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Active sessions</span>
              </div>
              <div className="text-xs text-slate-700 font-semibold pt-1">
                Current Browser Session
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold inline-block">
                Active now
              </span>
            </div>

            <span className="text-[10px] text-slate-400">1 session logged</span>
          </div>

          {/* Sign out of all devices card */}
          <div className="bg-[#FAF9F6] border border-[#EDECE8] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <LogOut className="w-4 h-4 text-indigo-600" />
                <span>Sign out of all devices</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Invalidate all active session tokens across other computers or mobile phones.
              </p>
            </div>

            <button
              onClick={handleSignOutAllDevices}
              className="py-2 px-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-[#EDECE8] transition-all cursor-pointer shadow-xs"
            >
              Sign out everywhere
            </button>
          </div>
        </div>
      </section>

      {/* 5. DANGER ZONE SECTION */}
      <section className="bg-white border border-[#EDECE8] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-[#EDECE8] pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            DANGER ZONE
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-stone-50/80 border border-stone-200 rounded-2xl">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Delete account</h3>
            <p className="text-xs text-[#6B7280]">
              Clear all local assessment data and sign out. Full account removal requires contacting support.
            </p>
          </div>

          {/* Neutral but clear destructive styling */}
          <button
            onClick={() => setIsDeleteAccountModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete account</span>
          </button>
        </div>
      </section>

      {/* MODAL: CHANGE PASSWORD */}
      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title="Change Password"
        description="Enter your current and new password."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            helperText="At least 6 characters."
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
          />

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DELETE DATA */}
      <Modal
        isOpen={isDeleteDataModalOpen}
        onClose={() => setIsDeleteDataModalOpen(false)}
        title="Delete Assessment Data"
        description="This action clears all local survey choices and uploaded transaction entries."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            Are you sure you want to clear your local assessment data? This will remove all survey answers and statement logs saved in this browser.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteDataModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteDataOnly}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Delete Data
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Delete Account Confirmation"
        description="Clear your local assessment data and sign out of this account."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            This action clears all reflection questionnaire answers and financial pattern logs stored on this
            device, then signs you out. It does not permanently delete your account record — contact support for
            that.
          </p>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-slate-600">
            <strong>Note:</strong> Once cleared, your local data cannot be restored.
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteAccountModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccountConfirmed}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Clear Data & Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
