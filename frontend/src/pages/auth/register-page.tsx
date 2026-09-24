import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleRoleAuthPanel } from '../../components/auth/google-role-auth-panel';
import { AuthRoleSelector } from '../../components/auth/auth-role-selector';
import { useAuth } from '../../app/providers/auth-provider';
import { useLanguage } from '../../app/providers/language-provider';
import { getApiErrorMessage } from '../../lib/api';
import type { GoogleAuthRole } from '../../types/auth';

function parseRole(value: string | null): GoogleAuthRole | null {
  return value === 'student' || value === 'teacher' ? value : null;
}

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = useMemo(() => parseRole(searchParams.get('role')), [searchParams]);
  const [selectedRole, setSelectedRole] = useState<GoogleAuthRole | null>(initialRole);
  const [hasContinued, setHasContinued] = useState<boolean>(Boolean(initialRole));
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasContinued || !selectedRole) {
    return (
      <AuthRoleSelector
        mode="register"
        selectedRole={selectedRole}
        onSelect={(role) => setSelectedRole(role)}
        onContinue={() => {
          if (!selectedRole) {
            return;
          }

          setSearchParams({ role: selectedRole });
          setHasContinued(true);
        }}
      />
    );
  }

  const roleLabel = t(`roleLabel.${selectedRole}`);

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">{t('register.eyebrow')}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
        {t('register.title', { role: roleLabel })}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {t('register.description', { role: roleLabel })}
      </p>

      <form
        className="mt-8 grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError(null);

          try {
            await register({
              ...form,
              intendedRole: selectedRole,
              preferredLanguage: language,
            });
            navigate(selectedRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
          } catch (submitError) {
            setError(getApiErrorMessage(submitError));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('register.fullName')}</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('emailLabel')}</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('register.phone')}</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('passwordLabel')}</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t('submitting') : t('register.submit')}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {t('register.haveAccount')}{' '}
        <Link to={`/login?role=${selectedRole}`} className="font-semibold text-teal-700">
          {t('register.loginLink')}
        </Link>
      </p>

      <GoogleRoleAuthPanel mode="register" selectedRole={selectedRole} />
    </div>
  );
}
