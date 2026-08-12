import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Menu,
  X,
  RotateCcw,
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  UserCircle,
  LogOut,
  ChevronDown,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSafeguard } from '../../context/SafeguardContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AppNavItem {
  labelKey: string;
  icon: React.ElementType;
  to: string;
}

const APP_NAV_ITEMS: AppNavItem[] = [
  { labelKey: 'navbar.overview', icon: LayoutDashboard, to: '/dashboard' },
  { labelKey: 'navbar.resources', icon: BookOpen, to: '/resources' },
];

export const Navbar: React.FC = () => {
  const {
    discreetMode,
    isDemoMode,
    resetDemo,
    isAuthenticated,
    user,
    logout,
    openAuthModal,
  } = useSafeguard();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isLanding = location.pathname === '/';
  // /resources is a shared, dual-purpose page. For a signed-out visitor it's
  // still "public site content", so keep the marketing nav chrome there too
  // instead of switching to the trimmed in-app nav they can't use anyway.
  // Authenticated users still get the normal app nav on /resources.
  const showMarketingNav = isLanding || (location.pathname === '/resources' && !isAuthenticated);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // Landing-page anchors live on "/" itself.
  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleResetDemo = () => {
    resetDemo();
    addToast({
      title: 'Demo Reset',
      description: 'Restored standard clean state.',
      type: 'info',
    });
    navigate('/');
  };

  const appNavLinkClass = (isActive: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap ${
      isActive ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <>
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-950 font-extrabold text-[12px] uppercase tracking-wider shrink-0">
                {t('navbar.demoMode')}
              </span>
              <span className="font-semibold text-amber-900/90 truncate">
                {t('navbar.demoDataLabel')}
              </span>
            </div>
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center space-x-1 font-bold text-amber-950 hover:text-amber-800 underline decoration-amber-500/40 cursor-pointer text-xs shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('navbar.resetDemo')}</span>
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#EDECE8] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Safeguard Logo & Icon */}
            <NavLink to="/" className="flex items-center space-x-3 group shrink-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
                <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {discreetMode ? 'Personal Ledger' : 'Safeguard'}
              </span>
            </NavLink>

            {showMarketingNav ? (
              <>
                {/* Middle Navigation — Landing / marketing */}
                <nav className="hidden md:flex items-center space-x-8">
                  <button
                    onClick={() => handleNavClick('how-it-works')}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {t('navbar.howItWorks')}
                  </button>
                  <button
                    onClick={() => handleNavClick('privacy')}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {t('navbar.privacy')}
                  </button>
                  <NavLink to="/resources" className={({ isActive }) => appNavLinkClass(isActive)}>
                    {t('navbar.resources')}
                  </NavLink>
                </nav>

                {/* Right Controls */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block">
                    <LanguageSwitcher />
                  </div>

                  {isAuthenticated ? (
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-700 bg-stone-100 px-3 py-2 rounded-xl border border-stone-200">
                        {user?.name || 'Account'}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        {t('navbar.signOut')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openAuthModal('login')}
                      className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F6] rounded-xl border border-[#EDECE8] transition-colors cursor-pointer"
                    >
                      {t('navbar.signIn')}
                    </button>
                  )}

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-[#EDECE8]"
                    aria-label={t('navbar.toggleNav')}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Middle Navigation — Logged-in app */}
                <nav className="hidden lg:flex items-center space-x-6 overflow-x-auto">
                  {APP_NAV_ITEMS.map((item) => (
                    <NavLink key={item.labelKey} to={item.to} className={({ isActive }) => appNavLinkClass(isActive)}>
                      {t(item.labelKey)}
                    </NavLink>
                  ))}
                </nav>

                {/* Right: Profile dropdown */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="hidden sm:block">
                    <LanguageSwitcher />
                  </div>
                  {isAuthenticated ? (
                    <div className="hidden sm:block relative" ref={profileMenuRef}>
                      <button
                        onClick={() => setProfileMenuOpen((prev) => !prev)}
                        className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          profileMenuOpen
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            : 'text-slate-700 bg-stone-100 border-stone-200 hover:bg-stone-200'
                        }`}
                        aria-haspopup="true"
                        aria-expanded={profileMenuOpen}
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>{user?.name || t('navbar.profile')}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EDECE8] rounded-2xl shadow-lg overflow-hidden z-50 animate-fade-in">
                          <div className="px-4 py-3 border-b border-stone-100">
                            <div className="text-sm font-bold text-slate-900 truncate">{user?.name || t('navbar.account')}</div>
                            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                          </div>
                          <NavLink
                            to="/settings"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-colors"
                          >
                            <SettingsIcon className="w-4 h-4 text-slate-400" />
                            <span>{t('navbar.settings')}</span>
                          </NavLink>
                          <NavLink
                            to="/settings/privacy"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            <span>{t('navbar.privacy')}</span>
                          </NavLink>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-stone-100 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('navbar.signOut')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => openAuthModal('login')}
                      className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F6] rounded-xl border border-[#EDECE8] transition-colors cursor-pointer"
                    >
                      {t('navbar.signIn')}
                    </button>
                  )}

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-[#EDECE8]"
                    aria-label={t('navbar.toggleNav')}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden md:hidden border-t border-[#EDECE8] bg-white px-6 pt-4 pb-6 space-y-3 animate-slide-down shadow-lg">
            {showMarketingNav ? (
              <>
                <button
                  onClick={() => handleNavClick('how-it-works')}
                  className="block w-full text-left py-2 text-base font-semibold text-slate-800 border-b border-stone-100"
                >
                  {t('navbar.howItWorks')}
                </button>
                <button
                  onClick={() => handleNavClick('privacy')}
                  className="block w-full text-left py-2 text-base font-semibold text-slate-800 border-b border-stone-100"
                >
                  {t('navbar.privacy')}
                </button>
                <NavLink
                  to="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-semibold text-slate-800 border-b border-stone-100"
                >
                  {t('navbar.resources')}
                </NavLink>
                <NavLink
                  to="/financial-data"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-semibold text-slate-800 border-b border-stone-100"
                >
                  {t('navbar.financialPatternScanner')}
                </NavLink>
                <div className="pt-2">
                  <LanguageSwitcher />
                </div>
              </>
            ) : (
              <>
                {APP_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.labelKey}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-base font-semibold text-slate-800 border-b border-stone-100"
                  >
                    {t(item.labelKey)}
                  </NavLink>
                ))}
                <div className="pt-2">
                  <LanguageSwitcher />
                </div>
              </>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {!isLanding && (
                    <>
                      <NavLink
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-2.5 text-slate-700 font-semibold border border-[#EDECE8] rounded-xl text-center text-sm flex items-center justify-center space-x-1.5"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>{t('navbar.settings')}</span>
                      </NavLink>
                      <NavLink
                        to="/settings/privacy"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-2.5 text-slate-700 font-semibold border border-[#EDECE8] rounded-xl text-center text-sm flex items-center justify-center space-x-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('navbar.privacy')}</span>
                      </NavLink>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 text-rose-700 font-semibold border border-rose-200 rounded-xl text-center text-sm bg-rose-50"
                  >
                    {t('navbar.signOut')} ({user?.name || user?.email})
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 text-slate-700 font-semibold border border-[#EDECE8] rounded-xl text-center text-sm"
                >
                  {t('navbar.signIn')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
