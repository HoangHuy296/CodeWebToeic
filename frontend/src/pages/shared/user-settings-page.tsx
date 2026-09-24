import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { useLanguage } from '../../app/providers/language-provider';
import { useTheme } from '../../app/providers/theme-provider';
import type { LanguageCode } from '../../types/auth';

type SettingsTab = 'general' | 'appearance' | 'language';

const roleLabelKeys: Record<string, 'general.roleStudent' | 'general.roleTeacher' | 'general.roleAdmin'> = {
  student: 'general.roleStudent',
  teacher: 'general.roleTeacher',
  admin: 'general.roleAdmin',
};

const profilePathByRole: Record<string, string> = {
  student: '/student/profile',
  teacher: '/teacher/profile',
  admin: '/admin/dashboard',
};

/**
 * Shared by /student/settings, /teacher/settings and /admin/account-settings (see
 * docs/language-en-vi-plan.md) — one "Cai Dat / Settings" page per role, same three tabs.
 */
export function UserSettingsPage() {
  const { t } = useTranslation('settings');
  const [tab, setTab] = useState<SettingsTab>('general');

  return (
    <div className="space-y-8">
      <div className="inline-flex rounded-full border border-stroke bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <TabButton active={tab === 'general'} onClick={() => setTab('general')} label={t('tabs.general')} />
        <TabButton active={tab === 'appearance'} onClick={() => setTab('appearance')} label={t('tabs.appearance')} />
        <TabButton active={tab === 'language'} onClick={() => setTab('language')} label={t('tabs.language')} />
      </div>

      {tab === 'general' ? <GeneralSection /> : null}
      {tab === 'appearance' ? <AppearanceSection /> : null}
      {tab === 'language' ? <LanguageSection /> : null}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-5 py-2.5 text-sm font-semibold transition',
        active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-900',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="surface-soft rounded-[1.5rem] p-6 sm:p-8">
      <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-teal-700 uppercase">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        {eyebrow}
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
    </section>
  );
}

function GeneralSection() {
  const { t } = useTranslation('settings');
  const { user, logout } = useAuth();
  const normalizedRole = user ? user.role.toLowerCase() : 'student';
  const roleLabel = t(roleLabelKeys[normalizedRole] ?? 'general.roleStudent');
  const profilePath = profilePathByRole[normalizedRole] ?? '/student/profile';

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow={t('general.eyebrow')} title={t('general.title')} description={t('general.description')} />

      <div className="rounded-[1.8rem] border border-stroke bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('general.fullName')}</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{user?.fullName ?? t('general.noName')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('general.email')}</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('general.role')}</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{roleLabel}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('general.status')}</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {user?.isActive ? t('general.active') : t('general.inactive')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={profilePath}
            className="rounded-full border border-stroke bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-teal-50"
          >
            {t('general.editProfile')}
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            {t('general.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { t } = useTranslation('settings');
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t('appearance.eyebrow')}
        title={t('appearance.title')}
        description={t('appearance.description')}
      />

      <div className="rounded-[1.8rem] border border-stroke bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={[
              'rounded-[1.4rem] border p-5 text-left transition',
              theme === 'light'
                ? 'border-teal-400 bg-teal-50 shadow-[0_12px_30px_rgba(20,184,166,0.15)]'
                : 'border-stroke bg-white hover:border-teal-200',
            ].join(' ')}
          >
            <p className="text-sm font-bold text-slate-950">{t('appearance.light')}</p>
            <p className="mt-1 text-xs text-slate-500">{t('appearance.lightHint')}</p>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={[
              'rounded-[1.4rem] border p-5 text-left transition',
              theme === 'dark'
                ? 'border-teal-400 bg-teal-50 shadow-[0_12px_30px_rgba(20,184,166,0.15)]'
                : 'border-stroke bg-white hover:border-teal-200',
            ].join(' ')}
          >
            <p className="text-sm font-bold text-slate-950">{t('appearance.dark')}</p>
            <p className="mt-1 text-xs text-slate-500">{t('appearance.darkHint')}</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function LanguageSection() {
  const { t } = useTranslation(['settings', 'common']);
  const { user } = useAuth();
  const { language, saveStatus, changeLanguage } = useLanguage();

  const options: { code: LanguageCode; label: string }[] = [
    { code: 'vi', label: t('languageName.vi', { ns: 'common' }) },
    { code: 'en', label: t('languageName.en', { ns: 'common' }) },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t('language.eyebrow')}
        title={t('language.title')}
        description={user ? t('language.description') : t('language.descriptionGuest')}
      />

      <div className="rounded-[1.8rem] border border-stroke bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                void changeLanguage(option.code);
              }}
              className={[
                'rounded-[1.4rem] border p-5 text-left transition',
                language === option.code
                  ? 'border-teal-400 bg-teal-50 shadow-[0_12px_30px_rgba(20,184,166,0.15)]'
                  : 'border-stroke bg-white hover:border-teal-200',
              ].join(' ')}
            >
              <p className="text-sm font-bold text-slate-950">{option.label}</p>
              {language === option.code ? (
                <p className="mt-1 text-xs text-slate-500">{t('language.current')}</p>
              ) : null}
            </button>
          ))}
        </div>

        {saveStatus !== 'idle' ? (
          <p
            className={[
              'mt-4 text-sm font-semibold',
              saveStatus === 'error' ? 'text-rose-600' : 'text-teal-700',
            ].join(' ')}
          >
            {t(`status.${saveStatus}`, { ns: 'common' })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
