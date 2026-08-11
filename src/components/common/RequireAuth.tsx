import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSafeguard } from '../../context/SafeguardContext';
import { Lock } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, authLoading, openAuthModal } = useSafeguard();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal('login', location.pathname + location.search);
    }
  }, [authLoading, isAuthenticated, location.pathname, location.search, openAuthModal]);

  if (authLoading) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Authentication Required
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            The private assessment section is protected. Please log in or create an account to view your confidential reflection tools.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login', location.pathname)}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Log in to continue
          </button>
          <button
            onClick={() => openAuthModal('signup', location.pathname)}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-stone-50 text-slate-700 font-bold text-sm rounded-xl border border-stone-200 transition-all cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
