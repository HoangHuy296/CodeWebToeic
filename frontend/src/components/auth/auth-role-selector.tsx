import { useTranslation } from 'react-i18next';
import type { GoogleAuthRole } from '../../types/auth';

interface AuthRoleSelectorProps {
  selectedRole: GoogleAuthRole | null;
  onSelect: (role: GoogleAuthRole) => void;
  onContinue: () => void;
  mode: 'login' | 'register';
}

function RoleIllustration({ role }: { role: GoogleAuthRole }) {
  if (role === 'teacher') {
    return (
      <svg viewBox="0 0 120 80" className="h-16 w-24" fill="none">
        <rect x="16" y="18" width="66" height="42" rx="10" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.38)" />
        <path d="M26 30H72" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 40H60" stroke="white" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 50H52" stroke="white" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
        <circle cx="92" cy="48" r="12" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.46)" />
        <path d="M92 36V52L102 58" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 80" className="h-16 w-24" fill="none">
      <rect x="18" y="18" width="48" height="44" rx="12" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.36)" />
      <path d="M30 30H54" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 40H46" stroke="white" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
      <circle cx="88" cy="40" r="16" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.4)" />
      <path d="M88 32V48" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 40H96" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function AuthRoleSelector({ selectedRole, onSelect, onContinue, mode }: AuthRoleSelectorProps) {
  const { t } = useTranslation('auth');

  const roleCards: Array<{ role: GoogleAuthRole; title: string; subtitle: string; accent: string }> = [
    {
      role: 'student',
      title: t('roleSelector.studentTitle'),
      subtitle: t('roleSelector.studentSubtitle'),
      accent: 'bg-teal-700',
    },
    {
      role: 'teacher',
      title: t('roleSelector.teacherTitle'),
      subtitle: t('roleSelector.teacherSubtitle'),
      accent: 'bg-teal-900',
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
        {mode === 'register' ? t('roleSelector.eyebrowRegister') : t('roleSelector.eyebrowLogin')}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
        {t('roleSelector.title')}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {t('roleSelector.description')}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {roleCards.map((card) => {
          const isSelected = selectedRole === card.role;
          return (
            <button
              key={card.role}
              type="button"
              onClick={() => onSelect(card.role)}
              className={[
                'group rounded-xl border p-4 text-left transition',
                isSelected
                  ? 'border-teal-300 bg-white shadow-[0_18px_40px_rgba(15,118,110,0.12)] ring-2 ring-teal-200/70'
                  : 'border-stroke bg-white/70 hover:border-teal-300 hover:bg-white',
              ].join(' ')}
            >
              <div
                className={[
                  'flex min-h-24 flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-4 text-white',
                  card.accent,
                ].join(' ')}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">{t('roleSelector.roleTag')}</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight">{card.title}</p>
                </div>
                <RoleIllustration role={card.role} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.subtitle}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selectedRole}
        className="btn-brand mt-6 h-12 w-full rounded-2xl text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t('roleSelector.continue')}
      </button>
    </div>
  );
}
