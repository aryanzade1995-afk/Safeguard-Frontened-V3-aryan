import { useCallback } from 'react';
import { useSafeguard } from '../context/SafeguardContext';
import { translations, TranslationTree } from '../i18n/translations';

const resolve = (tree: TranslationTree, path: string): string | undefined => {
  const value: unknown = path.split('.').reduce<unknown>((node, segment) => {
    if (node && typeof node === 'object') return (node as Record<string, unknown>)[segment];
    return undefined;
  }, tree);
  return typeof value === 'string' ? value : undefined;
};

// Single source of translated strings for the whole site, keyed off the same
// appLanguage that drives the chatbot's `language` request field — so the
// website and chatbot can never fall out of sync. Falls back to English for
// any key not yet translated in the current language, then to the raw key.
export const useTranslation = () => {
  const { appLanguage } = useSafeguard();

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      const raw =
        resolve(translations[appLanguage], key) ?? resolve(translations.en, key) ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (str, [name, value]) => str.replace(`{${name}}`, value),
        raw
      );
    },
    [appLanguage]
  );

  return { t, language: appLanguage };
};
