import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const scrollToAnchor = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-20 border-t border-[#EDECE8] bg-white py-12 px-4 sm:px-6 lg:px-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left branding */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">Safeguard</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Minimal Navigation Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
          <button
            onClick={() => scrollToAnchor('how-it-works')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            {t('footer.howItWorks')}
          </button>
          <button
            onClick={() => scrollToAnchor('privacy')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            {t('footer.privacy')}
          </button>
          <button
            onClick={() => scrollToAnchor('privacy')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            {t('footer.security')}
          </button>
          <NavLink to="/resources" className="hover:text-slate-900 transition-colors">
            {t('footer.resources')}
          </NavLink>
          <NavLink to="/settings" className="hover:text-slate-900 transition-colors">
            {t('footer.terms')}
          </NavLink>
          <NavLink to="/resources" className="hover:text-slate-900 transition-colors">
            {t('footer.contact')}
          </NavLink>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#EDECE8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-400">
        <p>{t('footer.copyright')}</p>
        <p className="italic">{t('footer.confidential')}</p>
      </div>
    </footer>
  );
};

