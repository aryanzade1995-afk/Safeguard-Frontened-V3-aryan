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
import { useTranslation } from '../hooks/useTranslation';
import { BackButton } from '../components/common/BackButton';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        title: t('settings.toast.updateFailedTitle'),
        description: res.error || t('settings.toast.updateFailedTitle'),
        type: 'warning',
      });
      return;
    }

    setIsEditingAccount(false);
    addToast({
      title: t('settings.toast.accountUpdatedTitle'),
      description: t('settings.toast.accountUpdatedDesc'),
      type: 'success',
    });
  };

  const handleSignOut = async () => {
    await logout();
    addToast({
      title: t('settings.toast.signedOutTitle'),
      description: t('settings.toast.signedOutDesc'),
      type: 'info',
    });
    navigate('/');
  };

  const handleSignOutAllDevices = async () => {
    const res = await signOutEverywhere();
    if (!res.success) {
      addToast({
        title: t('settings.toast.couldNotSignOutTitle'),
        description: res.error || t('results.tryAgain'),
        type: 'warning',
      });
      return;
    }
    addToast({
      title: t('settings.toast.signedOutAllTitle'),
      description: t('settings.toast.signedOutAllDesc'),
      type: 'info',
    });
    navigate('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      addToast({
        title: t('settings.toast.passwordsNoMatchTitle'),
        description: t('settings.toast.passwordsNoMatchDesc'),
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
        title: t('settings.toast.currentPasswordIncorrectTitle'),
        description: verifyRes.error || t('results.tryAgain'),
        type: 'warning',
      });
      return;
    }

    const updateRes = await updatePassword(newPass);
    setChangingPassword(false);

    if (!updateRes.success) {
      addToast({
        title: t('settings.toast.updateFailedTitle'),
        description: updateRes.error || t('settings.toast.updateFailedTitle'),
        type: 'warning',
      });
      return;
    }

    setIsChangePasswordModalOpen(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    addToast({
      title: t('settings.toast.passwordUpdatedTitle'),
      description: t('settings.toast.passwordUpdatedDesc'),
      type: 'success',
    });
  };

  const handleSaveExitSettings = () => {
    updateSettings({
      quickExitUrl: exitUrl,
      autoClearOnExit: autoClear,
    });
    addToast({
      title: t('settings.toast.privacySettingsTitle'),
      description: t('settings.toast.privacySettingsDesc'),
      type: 'success',
    });
  };

  const handleDeleteDataOnly = () => {
    wipeAllData();
    setIsDeleteDataModalOpen(false);
    addToast({
      title: t('settings.toast.dataDeletedTitle'),
      description: t('settings.toast.dataDeletedDesc'),
      type: 'info',
    });
  };

  const handleDeleteAccountConfirmed = async () => {
    wipeAllData();
    await logout();
    setIsDeleteAccountModalOpen(false);
    addToast({
      title: t('settings.toast.accountDeletedTitle'),
      description: t('settings.toast.accountDeletedDesc'),
      type: 'info',
    });
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-4 sm:py-6">
      <BackButton fallbackPath="/dashboard" />
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* 1. ACCOUNT SECTION */}
      <section className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{t('settings.account.title')}</h2>
              <p className="text-xs text-slate-500">{t('settings.account.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingAccount(!isEditingAccount)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            {isEditingAccount ? t('settings.account.cancel') : t('settings.account.edit')}
          </button>
        </div>

        {isEditingAccount ? (
          <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
            <Input
              label={t('settings.account.fullName')}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={t('settings.account.fullName')}
            />
            <Input
              label={t('settings.account.email')}
              type="email"
              value={user?.email || ''}
              disabled
              helperText={t('settings.account.emailHelper')}
            />
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                disabled={savingAccount}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {savingAccount ? t('settings.account.saving') : t('settings.account.saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingAccount(false);
                  setNameDraft(user?.name || '');
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {t('settings.account.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('settings.account.name')}
              </span>
              <div className="text-sm font-bold text-slate-900">{user?.name || '—'}</div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('settings.account.emailLabel')}
              </span>
              <div className="text-sm font-bold text-slate-900 truncate">{user?.email || '—'}</div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('settings.account.verification')}
              </span>
              {!user ? (
                <div className="text-sm font-bold text-slate-400">{t('settings.account.notSignedIn')}</div>
              ) : user.emailConfirmed ? (
                <div className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('settings.account.emailVerified')}</span>
                </div>
              ) : (
                <div className="text-sm font-bold text-amber-900 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('settings.account.pendingVerification')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>{t('settings.account.signOut')}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. PREFERENCES SECTION */}
      <section className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-stone-200 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{t('settings.preferences.title')}</h2>
            <p className="text-xs text-slate-500">{t('settings.preferences.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>{t('settings.preferences.notificationPrefs')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailUpdates}
                  onChange={(e) =>
                    setNotifications({ ...notifications, emailUpdates: e.target.checked })
                  }
                  className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">{t('settings.preferences.emailUpdates')}</span>
              </label>

              <label className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sessionReminders}
                  onChange={(e) =>
                    setNotifications({ ...notifications, sessionReminders: e.target.checked })
                  }
                  className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">{t('settings.preferences.sessionReminders')}</span>
              </label>

              <label className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.inAppAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, inAppAlerts: e.target.checked })
                  }
                  className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">{t('settings.preferences.inAppAlerts')}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>{t('settings.preferences.language')}</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                <span>{t('settings.preferences.appearance')}</span>
              </label>
              <select
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Light Warm">Light Warm (Editorial Neutral)</option>
                <option value="System Default">System Default</option>
                <option value="Soft Dark">Soft Dark (Eye-Safe)</option>
              </select>
            </div>
          </div>

          {/* Discreet Disguise Mode */}
          <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">{t('settings.preferences.discreetTitle')}</h4>
              <p className="text-[12px] text-slate-500">
                {t('settings.preferences.discreetDesc')}
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
              <span>{discreetMode ? t('settings.preferences.restoreLogo') : t('settings.preferences.enableDisguise')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. PRIVACY SECTION */}
      <section className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-stone-200 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{t('settings.privacy.title')}</h2>
            <p className="text-xs text-slate-500">{t('settings.privacy.subtitle')}</p>
          </div>
        </div>

        {/* Featured Privacy Center Link Card */}
        <NavLink to="/settings/privacy" className="block group">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between border border-indigo-800">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors">
                  {t('settings.privacy.centerTitle')}
                </h3>
                <p className="text-xs text-indigo-200/80">
                  {t('settings.privacy.centerDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300 group-hover:translate-x-1 transition-transform shrink-0 ml-3">
              <span>{t('settings.privacy.openCenter')}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </NavLink>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Data permissions */}
          <div className="space-y-3 bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {t('settings.privacy.dataPermissions')}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{t('settings.privacy.localParsing')}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                  {t('settings.privacy.granted')}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {t('settings.privacy.localParsingDesc')}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="font-bold text-slate-800">{t('settings.privacy.reflectionStorage')}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                  {t('settings.privacy.localSession')}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {t('settings.privacy.reflectionStorageDesc')}
              </p>
            </div>
          </div>

          {/* Delete data */}
          <div className="space-y-3 bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                {t('settings.privacy.deleteData')}
              </h3>
              <p className="text-xs text-slate-700 font-medium">
                {t('settings.privacy.deleteDataDesc')}
              </p>
            </div>

            <button
              onClick={() => setIsDeleteDataModalOpen(true)}
              className="py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs mt-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('settings.privacy.deleteAssessmentData')}</span>
            </button>
          </div>
        </div>

        {/* Quick Exit URL Preferences */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">{t('settings.privacy.quickExitUrl')}</span>
            <span className="text-[11px] text-slate-400">{t('settings.privacy.quickExitHint')}</span>
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
              {t('settings.privacy.saveUrl')}
            </button>
          </div>
        </div>
      </section>

      {/* 4. SECURITY SECTION */}
      <section className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-stone-200 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{t('settings.security.title')}</h2>
            <p className="text-xs text-slate-500">{t('settings.security.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sign-in method card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>{t('settings.security.signInMethod')}</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {!user
                  ? t('settings.security.signInNoUser')
                  : user.hasPasswordAuth
                  ? t('settings.security.signInPassword')
                  : t('settings.security.signInGoogle')}
              </p>
            </div>

            {user?.hasPasswordAuth ? (
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="py-2 px-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-stone-200 transition-all cursor-pointer shadow-xs w-fit"
              >
                {t('settings.security.updatePassword')}
              </button>
            ) : user ? (
              <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold inline-block w-fit">
                {t('settings.security.googleSignIn')}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 bg-stone-100 px-2 py-0.5 rounded-full font-bold inline-block w-fit">
                {t('settings.security.notSignedIn')}
              </span>
            )}
          </div>

          {/* Active sessions card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>{t('settings.security.activeSessions')}</span>
              </div>
              <div className="text-xs text-slate-700 font-semibold pt-1">
                {t('settings.security.currentSession')}
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold inline-block">
                {t('settings.security.activeNow')}
              </span>
            </div>

            <span className="text-[11px] text-slate-400">{t('settings.security.sessionsLogged')}</span>
          </div>

          {/* Sign out of all devices card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <LogOut className="w-4 h-4 text-indigo-600" />
                <span>{t('settings.security.signOutAllDevices')}</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {t('settings.security.signOutAllDesc')}
              </p>
            </div>

            <button
              onClick={handleSignOutAllDevices}
              className="py-2 px-3 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-stone-200 transition-all cursor-pointer shadow-xs"
            >
              {t('settings.security.signOutEverywhere')}
            </button>
          </div>
        </div>
      </section>

      {/* 5. DANGER ZONE SECTION */}
      <section className="bg-white border border-stone-200 rounded-[24px] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            {t('settings.danger.title')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-stone-50/80 border border-stone-200 rounded-2xl">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">{t('settings.danger.deleteAccount')}</h3>
            <p className="text-xs text-slate-500">
              {t('settings.danger.deleteAccountDesc')}
            </p>
          </div>

          {/* Neutral but clear destructive styling */}
          <button
            onClick={() => setIsDeleteAccountModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('settings.danger.deleteAccount')}</span>
          </button>
        </div>
      </section>

      {/* MODAL: CHANGE PASSWORD */}
      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title={t('settings.modals.changePasswordTitle')}
        description={t('settings.modals.changePasswordDesc')}
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label={t('settings.modals.currentPassword')}
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            required
          />
          <Input
            label={t('settings.modals.newPassword')}
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            helperText={t('settings.modals.passwordHint')}
          />
          <Input
            label={t('settings.modals.confirmNewPassword')}
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
              {t('settings.modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
            >
              {changingPassword ? t('settings.modals.updating') : t('settings.modals.updatePassword')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DELETE DATA */}
      <Modal
        isOpen={isDeleteDataModalOpen}
        onClose={() => setIsDeleteDataModalOpen(false)}
        title={t('settings.modals.deleteDataTitle')}
        description={t('settings.modals.deleteDataDesc')}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            {t('settings.modals.deleteDataConfirm')}
          </p>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteDataModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              {t('settings.modals.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDeleteDataOnly}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {t('settings.modals.deleteDataBtn')}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title={t('settings.modals.deleteAccountTitle')}
        description={t('settings.modals.deleteAccountDesc')}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            {t('settings.modals.deleteAccountConfirm')}
          </p>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[12px] text-slate-600">
            {t('settings.modals.deleteAccountNote')}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteAccountModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              {t('settings.modals.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccountConfirmed}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {t('settings.modals.deleteAccountBtn')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
