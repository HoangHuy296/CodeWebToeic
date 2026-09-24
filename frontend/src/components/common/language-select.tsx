import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../app/providers/language-provider';
import type { LanguageCode } from '../../types/auth';

/** Compact EN/VI switcher for the site header — works for guests too, same flow as Settings. */
export function LanguageSelect() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <label className="sr-only-focusable inline-flex items-center gap-1 rounded-full border border-stroke bg-white px-1 py-1 text-xs font-semibold text-slate-600">
      <span className="sr-only">{t('language.switcherLabel')}</span>
      <select
        value={language}
        onChange={(event) => {
          void changeLanguage(event.target.value as LanguageCode);
        }}
        aria-label={t('language.switcherLabel')}
        className="cursor-pointer appearance-none rounded-full bg-transparent px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
      >
        <option value="vi">VI</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}
