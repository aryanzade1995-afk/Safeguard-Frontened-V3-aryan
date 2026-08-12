import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Lock,
  Compass,
  PhoneCall,
  Scale,
  Building2,
  HelpCircle,
  X,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Info,
  Heart,
  Shield,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../hooks/useTranslation';

type ResourceGroup =
  | 'Financial autonomy'
  | 'Financial privacy'
  | 'Account access'
  | 'Financial planning';

const RESOURCE_GROUPS: ResourceGroup[] = [
  'Financial autonomy',
  'Financial privacy',
  'Account access',
  'Financial planning',
];

interface Article {
  id: string;
  title: string;
  category: string;
  group: ResourceGroup;
  readTime: string;
  summary: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Understanding your financial independence',
    category: 'Autonomy Basics',
    group: 'Financial autonomy',
    readTime: '4 min read',
    summary: 'A foundational overview of what constitutes independent financial capacity and how choices around personal funds shape long-term security.',
    content: [
      'Financial independence means having the resources, control, and decision-making power to meet your own needs without external pressure.',
      'It involves having unhindered access to individual bank accounts, clear visibility into household balance sheets, and freedom to earn or manage income.',
      'Developing individual savings, understanding credit reports, and maintaining personal identification documents are key practical steps toward personal autonomy.',
    ],
  },
  {
    id: 'art-2',
    title: 'What transaction history can—and cannot—tell you',
    category: 'Pattern Analysis',
    group: 'Financial autonomy',
    readTime: '5 min read',
    summary: 'Exploring how mathematical transaction records highlight statistical anomalies without proving intent, pressure, or context.',
    content: [
      'Bank statement CSVs or debit logs contain dates, merchant names, and currency amounts. They reflect movement of funds.',
      'However, data logs cannot capture human conversations, coercion, or underlying arrangements between account holders.',
      'When reviewing transaction patterns, treat them as observational signals rather than definitive proof of intent or wrongdoing.',
    ],
  },
  {
    id: 'art-3',
    title: 'Creating a personal financial safety plan',
    category: 'Planning & Security',
    group: 'Financial planning',
    readTime: '6 min read',
    summary: 'Practical, step-by-step measures for safeguarding emergency reserves, identity records, and secondary communication channels.',
    content: [
      'A personal safety plan outlines discreet steps for establishing individual financial security over time.',
      'Key components include securing physical documents (passports, birth certificates, tax forms), setting up paperless digital delivery to an unshared email, and building an independent emergency reserve.',
      'Always prioritize your physical and emotional safety when making adjustments to account access.',
    ],
  },
  {
    id: 'art-4',
    title: 'Protecting sensitive financial information',
    category: 'Digital Privacy',
    group: 'Financial privacy',
    readTime: '4 min read',
    summary: 'General guidelines for securing online banking credentials, enabling two-factor authentication, and managing browser sessions safely.',
    content: [
      'Digital privacy is essential when accessing personal banking or assessment tools.',
      'Use strong, unique passwords for individual financial portals, enable multi-factor authentication (MFA) using authentication apps rather than shared SMS lines, and use private browsing modes on shared devices.',
      'Regularly review device permissions and logged-in account sessions to ensure unrecognized devices do not retain access.',
    ],
  },
  {
    id: 'art-5',
    title: 'Understanding shared accounts',
    category: 'Account Structures',
    group: 'Account access',
    readTime: '5 min read',
    summary: 'How joint bank accounts, authorized user credit cards, and shared loans function legally and practically.',
    content: [
      'Joint accounts grant equal legal rights to both named owners, meaning either party can withdraw funds at any time unless multi-signature rules are established.',
      'Authorized users on credit cards can make purchases but are generally not legally responsible for card balances.',
      'Understanding the legal differences between joint ownership, primary account ownership, and authorized access helps in structuring healthy financial boundaries.',
    ],
  },
];

interface SupportCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  details: string;
  contactInfo: string;
}

const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: 'professional',
    title: 'Professional support',
    icon: <Heart className="w-5 h-5 text-indigo-600" />,
    description: 'Connect with certified counselors and advocacy specialists for emotional, psychological, and safety guidance.',
    details: 'Professional support services offer free, confidential, 24/7 counseling to help you explore your options at your own pace without pressure.',
    contactInfo: 'National Support Hotline: 1-800-799-SAFE (7233) or Text "START" to 88788',
  },
  {
    id: 'financial',
    title: 'Financial guidance',
    icon: <Building2 className="w-5 h-5 text-indigo-600" />,
    description: 'Access non-profit credit counseling, budgeting tools, and unbiased financial literacy organizations.',
    details: 'Non-profit financial counselors help create personal budgets, understand credit reports, and navigate debt management options.',
    contactInfo: 'National Foundation for Credit Counseling (NFCC): www.nfcc.org',
  },
  {
    id: 'legal',
    title: 'Legal information',
    icon: <Scale className="w-5 h-5 text-indigo-600" />,
    description: 'Understand state laws regarding joint property, debt liability, asset division, and protective remedies.',
    details: 'Legal advocacy groups provide plain-language explanations of financial rights, joint account liabilities, and legal aid options.',
    contactInfo: 'WomensLaw.org & Legal Aid Directory: www.womenslaw.org',
  },
  {
    id: 'emergency',
    title: 'Emergency support',
    icon: <PhoneCall className="w-5 h-5 text-indigo-600" />,
    description: 'Immediate confidential resources for urgent housing, safety planning, and crisis navigation services.',
    details: 'Emergency pathways connect individuals with local shelters, safe transport options, and immediate crisis counselors.',
    contactInfo: 'Local Emergency Line: 911 / Crisis Text Line: Text "HOME" to 741741',
  },
];

export const Resources: React.FC = () => {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
      addToast({
        title: t('resources.toast.removedTitle'),
        description: t('resources.toast.removedDesc', { title }),
        type: 'info',
      });
    } else {
      setSavedIds([...savedIds, id]);
      addToast({
        title: t('resources.toast.savedTitle'),
        description: t('resources.toast.savedDesc', { title }),
        type: 'success',
      });
    }
  };

  const savedArticles = ARTICLES.filter((a) => savedIds.includes(a.id));
  const savedCategories = SUPPORT_CATEGORIES.filter((c) => savedIds.includes(c.id));

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleOpenSupport = (category: SupportCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in py-4 sm:py-6">
      {/* HEADER */}
      <div className="space-y-4 border-b border-[#EDECE8] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('resources.badge')}</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-stone-100/80 rounded-xl border border-stone-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('resources.tabs.all')}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'saved'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${savedIds.length > 0 ? 'fill-indigo-600 text-indigo-600' : ''}`} />
              <span>{t('resources.tabs.saved')} ({savedIds.length})</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
          {t('resources.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl leading-relaxed">
          {t('resources.subtitle')}
        </p>
      </div>

      {activeTab === 'saved' ? (
        /* SAVED TAB CONTENT OR EMPTY STATE */
        <div className="space-y-8 animate-fade-in">
          {savedArticles.length === 0 && savedCategories.length === 0 ? (
            <div className="bg-white border border-[#EDECE8] rounded-[28px] p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{t('resources.empty.title')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  {t('resources.empty.desc')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
              >
                <span>{t('resources.empty.browse')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {savedArticles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">{t('resources.savedArticles')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedArticles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => handleOpenArticle(article)}
                        className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between cursor-pointer hover:border-indigo-300 transition-all group relative"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 bg-stone-100 text-slate-700 text-[11px] font-bold rounded-full">
                              {t(`resources.articles.${article.id}.category`)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleSave(article.id, article.title, e)}
                              className="p-1.5 text-indigo-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Heart className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                            </button>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">{t(`resources.articles.${article.id}.title`)}</h4>
                          <p className="text-xs text-[#6B7280] leading-relaxed">{t(`resources.articles.${article.id}.summary`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savedCategories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">{t('resources.savedContacts')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {savedCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-indigo-50 rounded-xl">{cat.icon}</div>
                            <h4 className="font-bold text-slate-900 text-base">{t(`resources.categories.${cat.id}.title`)}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => toggleSave(cat.id, cat.title, e)}
                            className="p-1.5 text-indigo-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Heart className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                          </button>
                        </div>
                        <p className="text-xs text-[#6B7280] leading-relaxed">{t(`resources.categories.${cat.id}.description`)}</p>
                        <button
                          onClick={() => handleOpenSupport(cat)}
                          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all"
                        >
                          {t('resources.viewDetails')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ALL RESOURCES TAB CONTENT */
        <>

      {/* FEATURED SECTION (Three Large Cards) */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
          {t('resources.pillars.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Understanding financial autonomy */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 hover:border-indigo-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {t('resources.pillars.p1.title')}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t('resources.pillars.p1.desc')}
              </p>
            </div>
            <p className="text-[12px] text-slate-500 pt-3 border-t border-[#EDECE8] italic">
              {t('resources.pillars.p1.note')}
            </p>
          </div>

          {/* Card 2: Recognizing financial pressure */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 hover:border-indigo-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {t('resources.pillars.p2.title')}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t('resources.pillars.p2.desc')}
              </p>
            </div>
            <p className="text-[12px] text-slate-500 pt-3 border-t border-[#EDECE8] italic">
              {t('resources.pillars.p2.note')}
            </p>
          </div>

          {/* Card 3: Protecting financial privacy */}
          <div className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 hover:border-indigo-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {t('resources.pillars.p3.title')}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t('resources.pillars.p3.desc')}
              </p>
            </div>
            <p className="text-[12px] text-slate-500 pt-3 border-t border-[#EDECE8] italic">
              {t('resources.pillars.p3.note')}
            </p>
          </div>
        </div>
      </div>

      {/* SUPPORT (Categorized Cards) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            {t('resources.support.title')}
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {t('resources.support.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SUPPORT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-indigo-200 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl">{cat.icon}</div>
                  <h3 className="font-bold text-slate-900 text-base">{t(`resources.categories.${cat.id}.title`)}</h3>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed pt-1">
                  {t(`resources.categories.${cat.id}.description`)}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EDECE8] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{t('resources.support.freeConfidential')}</span>
                <button
                  onClick={() => handleOpenSupport(cat)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>{t('resources.support.learnMore')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDUCATIONAL ARTICLES — GROUPED BY CATEGORY */}
      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            {t('resources.articlesSection.title')}
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {t('resources.articlesSection.subtitle')}
          </p>
        </div>

        {RESOURCE_GROUPS.map((group) => {
          const groupArticles = ARTICLES.filter((a) => a.group === group);
          if (groupArticles.length === 0) return null;
          return (
            <div key={group} className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700">
                {t(`resources.groups.${group}`)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleOpenArticle(article)}
                    className="bg-white border border-[#EDECE8] rounded-[24px] p-6 shadow-xs space-y-4 flex flex-col justify-between cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-stone-100 text-slate-700 text-[11px] font-bold rounded-full border border-stone-200">
                          {t(`resources.articles.${article.id}.category`)}
                        </span>
                        <span className="text-[11px] text-slate-400">{t(`resources.articles.${article.id}.readTime`)}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug">
                        {t(`resources.articles.${article.id}.title`)}
                      </h4>

                      <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">
                        {t(`resources.articles.${article.id}.summary`)}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EDECE8] flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      <span>{t('resources.readGuide')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* IMPORTANT DISCLAIMER */}
      <div className="p-6 bg-[#FAF9F6] border border-[#EDECE8] rounded-[24px] space-y-2">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>{t('resources.disclaimer.title')}</span>
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          {t('resources.disclaimer.text')}
        </p>
      </div>

      {/* MODAL: ARTICLE READER — portaled to <body> so its `fixed` overlay is
          never re-parented under an ancestor with an active `transform`
          (e.g. this page's own `animate-fade-in`), which would otherwise
          shrink it down to that ancestor's box instead of the viewport. */}
      {selectedArticle && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#EDECE8] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#EDECE8] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full">
                    {t(`resources.articles.${selectedArticle.id}.category`)}
                  </span>
                  <span className="text-xs text-slate-400">• {t(`resources.articles.${selectedArticle.id}.readTime`)}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {t(`resources.articles.${selectedArticle.id}.title`)}
                </h3>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArticle.content.map((_paragraph, idx) => (
                <p key={idx} className="bg-[#FAF9F6] p-4 rounded-xl border border-[#EDECE8]">
                  {t(`resources.articles.${selectedArticle.id}.content.${idx}`)}
                </p>
              ))}
            </div>

            <div className="pt-4 border-t border-[#EDECE8] flex items-center justify-between">
              <span className="text-xs text-slate-400 italic">{t('resources.educationalSeries')}</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
              >
                {t('resources.closeGuide')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: SUPPORT DIRECTORY DETAILS — also portaled, same reason. */}
      {selectedCategory && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#EDECE8] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#EDECE8] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">{selectedCategory.icon}</div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{t(`resources.categories.${selectedCategory.id}.title`)}</h3>
                  <span className="text-xs text-slate-500">{t('resources.resourceInfo')}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <p className="leading-relaxed bg-[#FAF9F6] p-4 rounded-xl border border-[#EDECE8]">
                {t(`resources.categories.${selectedCategory.id}.details`)}
              </p>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block">
                  {t('resources.contactDirectory')}
                </span>
                <p className="font-mono font-bold text-indigo-950 text-xs sm:text-sm">
                  {selectedCategory.contactInfo}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[12px] text-slate-400">{t('resources.allContactsFree')}</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
              >
                {t('resources.gotIt')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Resources;
