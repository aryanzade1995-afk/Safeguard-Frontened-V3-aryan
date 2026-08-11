import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  FinancialPattern,
  Transaction,
  UserSettings,
} from '../types';
import {
  DEMO_TRANSACTIONS,
  DEMO_PATTERNS,
  DEMO_QUESTIONNAIRE_ANSWERS,
} from '../data/demoData';
import { supabase } from '../services/supabaseClient';

export interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

// Supabase surfaces raw network/browser errors (e.g. "Failed to fetch") as-is;
// translate the common ones into something a user can act on.
const friendlyAuthError = (message: string): string => {
  if (/failed to fetch|network/i.test(message)) {
    return 'Unable to reach the authentication service. Please check your connection and try again.';
  }
  return message;
};

// Default initial mock patterns (non-diagnostic, reflective)
const INITIAL_PATTERNS: FinancialPattern[] = [
  {
    id: 'pat-1',
    category: 'account_access',
    title: 'Single-Party Credential Control',
    description:
      'Primary digital banking access and password recovery options are registered under a single shared contact address or restricted email.',
    severity: 'elevated',
    dateDetected: '2026-08-01',
    evidenceCount: 2,
    reflectionQuestions: [
      'Do you have direct, unmonitored access to log into your joint or individual bank accounts?',
      'Can you reset account passwords independently if needed?',
    ],
    recommendedActions: [
      'Set up a secondary confidential personal email for sensitive financial communications.',
      'Request individual online banking credentials from your financial institution.',
    ],
  },
  {
    id: 'pat-2',
    category: 'transaction_anomaly',
    title: 'Unusual High-Volume Cash Withdrawals',
    description:
      'A series of regular cash withdrawals were logged from a joint checking account following pay deposit dates without secondary receipts.',
    severity: 'moderate',
    dateDetected: '2026-08-05',
    evidenceCount: 4,
    reflectionQuestions: [
      'Are cash withdrawals mutually agreed upon or discussed prior to execution?',
      'Do you feel comfortable asking about joint account cash withdrawals?',
    ],
    recommendedActions: [
      'Enable instant push notifications for joint account transfers over $50.',
      'Keep personal record of individual contribution allocations.',
    ],
  },
  {
    id: 'pat-3',
    category: 'documentation',
    title: 'Restricted Access to Critical Tax Documents',
    description:
      'Joint tax filings, credit reports, and deed titles are held exclusively in a restricted offline or digital location.',
    severity: 'informational',
    dateDetected: '2026-07-28',
    evidenceCount: 1,
    reflectionQuestions: [
      'Do you have copies or digital scans of your official government ID, tax returns, and social security card?',
    ],
    recommendedActions: [
      'Create a secure, encrypted personal cloud folder or physical document folder stored in a safe location.',
    ],
  },
];

// Mock initial financial transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    date: '2026-08-06',
    description: 'ATM Cash Withdrawal - Main St Branch',
    amount: 500.0,
    category: 'Cash & ATM',
    accountName: 'Joint Checking (..4821)',
    isJoint: true,
    flagged: true,
    flagReason: 'Unusual cash outflow relative to monthly average',
    userNote: 'Unexplained cash withdrawal following salary deposit',
  },
  {
    id: 'tx-102',
    date: '2026-08-04',
    description: 'Auto Transfer to External Savings',
    amount: 1200.0,
    category: 'Transfer',
    accountName: 'Joint Checking (..4821)',
    isJoint: true,
    flagged: true,
    flagReason: 'Transfer to non-joint external account',
    userNote: 'Moved funds out of shared view',
  },
  {
    id: 'tx-103',
    date: '2026-08-02',
    description: 'Grocery Superstore',
    amount: 142.5,
    category: 'Groceries',
    accountName: 'Joint Credit Card (..9012)',
    isJoint: true,
    flagged: false,
  },
  {
    id: 'tx-104',
    date: '2026-07-29',
    description: 'Primary Income Salary Deposit',
    amount: 3450.0,
    category: 'Income',
    accountName: 'Joint Checking (..4821)',
    isJoint: true,
    flagged: false,
  },
  {
    id: 'tx-105',
    date: '2026-07-25',
    description: 'Department Store - Card Authorization Removed',
    amount: 85.0,
    category: 'Shopping',
    accountName: 'Joint Credit Card (..9012)',
    isJoint: true,
    flagged: true,
    flagReason: 'Authorized secondary card user status altered',
  },
];

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailConfirmed: boolean;
  hasPasswordAuth: boolean;
}

interface SafeguardContextType {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<AuthResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  signOutEverywhere: () => Promise<AuthResult>;
  updateFullName: (fullName: string) => Promise<AuthResult>;
  showAuthModal: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup', redirectTarget?: string) => void;
  closeAuthModal: () => void;
  authRedirectTarget: string | null;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  discreetMode: boolean;
  toggleDiscreetMode: () => void;
  isDemoMode: boolean;
  startDemo: () => void;
  resetDemo: () => void;
  patterns: FinancialPattern[];
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  toggleFlagTransaction: (id: string, reason?: string) => void;
  updateTransactionNote: (id: string, note: string) => void;
  questionnaireAnswers: Record<string, string>;
  setQuestionnaireAnswer: (questionId: string, answer: string) => void;
  triggerQuickExit: () => void;
  wipeAllData: () => void;
  calculatedScore: {
    autonomyIndex: number; // 0 - 100
    vulnerabilityLevel: 'low' | 'moderate' | 'elevated' | 'high';
    keyInsights: string[];
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  discreetMode: false,
  quickExitUrl: 'https://www.weather.com',
  autoClearOnExit: false,
  pinProtected: false,
  analyticsOptOut: true,
  themeStyle: 'default',
};

const SafeguardContext = createContext<SafeguardContextType | undefined>(undefined);

export const SafeguardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state is sourced entirely from Supabase (session + profiles table),
  // never persisted manually — supabase-js already persists the session in
  // localStorage under its own key and keeps it fresh.
  const [session, setSession] = useState<Session | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    if (!error) {
      const row = data as { full_name: string | null; avatar_url: string | null } | null;
      setProfileName(row?.full_name || null);
      setProfileAvatarUrl(row?.avatar_url || null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfileName(null);
        setProfileAvatarUrl(null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const user: User | null = session?.user
    ? (() => {
        const appMetadata = session.user.app_metadata as { provider?: string; providers?: string[] };
        const userMetadata = session.user.user_metadata as { avatar_url?: string; picture?: string };
        const hasPasswordAuth = appMetadata.providers
          ? appMetadata.providers.includes('email')
          : appMetadata.provider === 'email';
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: profileName || (session.user.email ? session.user.email.split('@')[0] : 'Account'),
          avatarUrl: profileAvatarUrl || userMetadata.avatar_url || userMetadata.picture || null,
          emailConfirmed: Boolean(session.user.email_confirmed_at),
          hasPasswordAuth,
        };
      })()
    : null;

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authRedirectTarget, setAuthRedirectTarget] = useState<string | null>(null);

  const openAuthModal = (tab: 'login' | 'signup' = 'login', redirectTarget?: string) => {
    setAuthModalTab(tab);
    if (redirectTarget) {
      setAuthRedirectTarget(redirectTarget);
    }
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const MIN_PASSWORD_LENGTH = 6;

  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: fullName?.trim() ? { full_name: fullName.trim() } : undefined,
      },
    });

    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }

    if (data.session) {
      setSession(data.session);
      if (data.session.user) {
        await fetchProfile(data.session.user.id);
      }
      return { success: true };
    }

    // Email confirmation is required before Supabase issues a session.
    return { success: true, needsEmailConfirmation: true };
  };

  const signInWithPassword = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }

    setSession(data.session);
    if (data.session?.user) {
      await fetchProfile(data.session.user.id);
    }
    return { success: true };
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }

    // The browser is now navigating to Google — the session is picked up by
    // the onAuthStateChange listener once it redirects back into the app.
    return { success: true };
  };

  const requestPasswordReset = async (email: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfileName(null);
    setProfileAvatarUrl(null);
  };

  const signOutEverywhere = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    setSession(null);
    setProfileName(null);
    setProfileAvatarUrl(null);
    return { success: true };
  };

  const updateFullName = async (fullName: string): Promise<AuthResult> => {
    if (!session?.user) {
      return { success: false, error: 'You must be signed in to update your profile.' };
    }
    const trimmed = fullName.trim();
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email,
      full_name: trimmed,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    setProfileName(trimmed || null);
    return { success: true };
  };

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('safeguard_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('safeguard_is_demo') === 'true';
  });

  const [patterns] = useState<FinancialPattern[]>(INITIAL_PATTERNS);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const isDemo = localStorage.getItem('safeguard_is_demo') === 'true';
    if (isDemo) return DEMO_TRANSACTIONS;
    const saved = localStorage.getItem('safeguard_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>(() => {
    const isDemo = localStorage.getItem('safeguard_is_demo') === 'true';
    if (isDemo) return DEMO_QUESTIONNAIRE_ANSWERS;
    const saved = localStorage.getItem('safeguard_questionnaire');
    return saved ? JSON.parse(saved) : {};
  });

  const startDemo = () => {
    setIsDemoMode(true);
    setTransactions(DEMO_TRANSACTIONS);
    setQuestionnaireAnswers(DEMO_QUESTIONNAIRE_ANSWERS);
    localStorage.setItem('safeguard_is_demo', 'true');
    localStorage.setItem('safeguard_transactions', JSON.stringify(DEMO_TRANSACTIONS));
    localStorage.setItem('safeguard_questionnaire', JSON.stringify(DEMO_QUESTIONNAIRE_ANSWERS));
  };

  const resetDemo = () => {
    setIsDemoMode(false);
    setTransactions(INITIAL_TRANSACTIONS);
    setQuestionnaireAnswers({});
    localStorage.removeItem('safeguard_is_demo');
    localStorage.setItem('safeguard_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem('safeguard_questionnaire', JSON.stringify({}));
  };

  useEffect(() => {
    localStorage.setItem('safeguard_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('safeguard_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('safeguard_questionnaire', JSON.stringify(questionnaireAnswers));
  }, [questionnaireAnswers]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleDiscreetMode = () => {
    setSettings((prev) => ({ ...prev, discreetMode: !prev.discreetMode }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substring(2, 8),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const toggleFlagTransaction = (id: string, reason?: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              flagged: !t.flagged,
              flagReason: !t.flagged ? reason || 'User marked for pattern review' : undefined,
            }
          : t
      )
    );
  };

  const updateTransactionNote = (id: string, note: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, userNote: note } : t))
    );
  };

  const setQuestionnaireAnswer = (questionId: string, answer: string) => {
    setQuestionnaireAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const triggerQuickExit = () => {
    if (settings.autoClearOnExit) {
      localStorage.clear();
    }
    window.location.href = settings.quickExitUrl || 'https://www.weather.com';
  };

  // Clears only Safeguard's own local app data (assessment answers, transactions,
  // preferences, cached analysis) — never the Supabase session, which lives under
  // its own storage key and is managed exclusively via sign-out.
  const wipeAllData = () => {
    localStorage.removeItem('safeguard_transactions');
    localStorage.removeItem('safeguard_questionnaire');
    localStorage.removeItem('safeguard_assessment');
    localStorage.removeItem('safeguard_settings');
    localStorage.removeItem('safeguard_is_demo');
    setIsDemoMode(false);
    setTransactions(INITIAL_TRANSACTIONS);
    setQuestionnaireAnswers({});
    setSettings(DEFAULT_SETTINGS);
  };

  // Calculate non-diagnostic financial autonomy metric
  const calculateAutonomyScore = () => {
    let baseScore = 82; // Initial healthy autonomy starting baseline
    const flaggedCount = transactions.filter((t) => t.flagged).length;
    baseScore -= flaggedCount * 8;

    const answeredCount = Object.keys(questionnaireAnswers).length;
    if (answeredCount > 0) {
      // Adjust score based on answered questionnaire weights
      Object.values(questionnaireAnswers).forEach((val) => {
        const valStr = val as string;
        if (valStr.includes('restricted') || valStr.includes('no_access') || valStr.includes('approval_required')) {
          baseScore -= 10;
        } else if (valStr.includes('shared_collaborative') || valStr.includes('independent')) {
          baseScore += 3;
        }
      });
    }

    const finalScore = Math.max(15, Math.min(100, baseScore));

    let level: 'low' | 'moderate' | 'elevated' | 'high' = 'low';
    if (finalScore < 40) level = 'high';
    else if (finalScore < 60) level = 'elevated';
    else if (finalScore < 78) level = 'moderate';

    const insights: string[] = [
      'Your financial profile reflects mostly independent access with 1-2 areas to review.',
      'Maintaining an emergency individual account enhances financial resilience.',
      'Regular review of joint account authorization settings is recommended.',
    ];

    if (level === 'elevated' || level === 'high') {
      insights.unshift(
        'Patterns suggest significant reliance on shared accounts with restricted individual visibility.'
      );
    }

    return {
      autonomyIndex: finalScore,
      vulnerabilityLevel: level,
      keyInsights: insights,
    };
  };

  const currentPatterns = isDemoMode ? DEMO_PATTERNS : patterns;

  return (
    <SafeguardContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        authLoading,
        signUpWithPassword,
        signInWithPassword,
        signInWithGoogle,
        requestPasswordReset,
        updatePassword,
        logout,
        signOutEverywhere,
        updateFullName,
        showAuthModal,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        authRedirectTarget,
        settings,
        updateSettings,
        discreetMode: settings.discreetMode,
        toggleDiscreetMode,
        isDemoMode,
        startDemo,
        resetDemo,
        patterns: currentPatterns,
        transactions,
        addTransaction,
        toggleFlagTransaction,
        updateTransactionNote,
        questionnaireAnswers,
        setQuestionnaireAnswer,
        triggerQuickExit,
        wipeAllData,
        calculatedScore: calculateAutonomyScore(),
      }}
    >
      {children}
    </SafeguardContext.Provider>
  );
};

export const useSafeguard = () => {
  const context = useContext(SafeguardContext);
  if (!context) {
    throw new Error('useSafeguard must be used within a SafeguardProvider');
  }
  return context;
};
