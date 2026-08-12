import React, { useEffect, useRef, useState } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useSafeguard } from '../../context/SafeguardContext';
import { getVoiceConfig } from '../../services/voiceService';
import { AppLanguageCode } from '../../types';

// Fallback labels only used if the backend call below hasn't resolved yet —
// values mirror services/voice_service.py's SUPPORTED_LANGUAGES exactly, so
// nothing here is ever a language the backend doesn't actually support.
const FALLBACK_LABELS: Record<AppLanguageCode, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

export const LanguageSwitcher: React.FC = () => {
  const { appLanguage, setAppLanguage } = useSafeguard();
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>(FALLBACK_LABELS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    getVoiceConfig(appLanguage)
      .then((config) => {
        if (isMounted && config.supported_languages) {
          setLabels(config.supported_languages);
        }
      })
      .catch(() => {
        // Non-fatal — keep the fallback en/hi/mr labels above.
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const codes = Object.keys(labels) as AppLanguageCode[];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Change language"
        className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
          open
            ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
            : 'text-slate-600 bg-white border-[#EDECE8] hover:bg-[#FAF9F6]'
        }`}
      >
        <Languages className="w-3.5 h-3.5" />
        <span className="uppercase">{appLanguage}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-[#EDECE8] rounded-2xl shadow-lg overflow-hidden z-50 animate-fade-in">
          {codes.map((code) => (
            <button
              key={code}
              onClick={() => {
                setAppLanguage(code);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <span>{labels[code]}</span>
              {appLanguage === code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
