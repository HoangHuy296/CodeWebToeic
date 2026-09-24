import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/providers/auth-provider';
import { getApiErrorMessage } from '../../lib/api';
import { getDefaultRolePath } from '../../routes/path-utils';
import type { AppRole, GoogleAuthRole } from '../../types/auth';
import { GoogleRoleAuthPanel } from './google-role-auth-panel';

interface LoginFormProps {
  variant?: 'user' | 'admin';
  selectedRole?: GoogleAuthRole;
}

export function LoginForm({ variant = 'user', selectedRole }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const contentMap = {
    user: {
      eyebrow: t('user.eyebrow'),
      title: t('user.title'),
      description: t('user.description'),
      defaultEmail: 'student1@ivyts.dev',
      defaultPassword: 'Password@123',
      submitLabel: t('user.submitLabel'),
      altLabel: t('user.altLabel'),
      altLinkLabel: t('user.altLinkLabel'),
      altLinkTo: '/register',
      secondaryLinkLabel: t('user.secondaryLinkLabel'),
      secondaryLinkTo: '/admin/login',
      allowedRole: null as AppRole | null,
      blockedMessage: t('user.blockedMessage'),
      emailInputType: 'email' as const,
    },
    admin: {
      eyebrow: t('admin.eyebrow'),
      title: t('admin.title'),
      description: t('admin.description'),
      defaultEmail: '',
      defaultPassword: '',
      submitLabel: t('admin.submitLabel'),
      altLabel: t('admin.altLabel'),
      altLinkLabel: t('admin.altLinkLabel'),
      altLinkTo: '/login',
      secondaryLinkLabel: t('admin.secondaryLinkLabel'),
      secondaryLinkTo: '/',
      allowedRole: 'admin' as AppRole,
      blockedMessage: t('admin.blockedMessage'),
      emailInputType: 'email' as const,
    },
  };

  const content = contentMap[variant];
  const roleLabels: Record<GoogleAuthRole, string> = {
    student: t('roleLabel.student'),
    teacher: t('roleLabel.teacher'),
  };
  const defaultUserEmail =
    variant === 'user' && selectedRole === 'teacher' ? 'teacher@ivyts.dev' : content.defaultEmail;
  const [email, setEmail] = useState(defaultUserEmail);
  const [password, setPassword] = useState(content.defaultPassword);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
        {content.eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{content.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {variant === 'user' && selectedRole
          ? t('loggingInAsRole', { role: roleLabels[selectedRole] })
          : content.description}
      </p>

      <form
        className="mt-8 grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError(null);

          try {
            const user = await login({ email, password });

            if (content.allowedRole && user.role !== content.allowedRole) {
              await logout();
              setError(content.blockedMessage);
              return;
            }

            navigate(redirectTo ?? getDefaultRolePath(user.role), { replace: true });
          } catch (submitError) {
            setError(getApiErrorMessage(submitError));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('emailLabel')}</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type={content.emailInputType}
            autoComplete="email"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('passwordLabel')}</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brand mt-2 h-12 rounded-2xl text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t('submitting') : content.submitLabel}
        </button>
      </form>

      <div className="mt-6 grid gap-2 text-sm text-slate-600">
        <p>
          {content.altLabel}{' '}
          <Link
            to={selectedRole && content.altLinkTo.startsWith('/') ? `${content.altLinkTo}?role=${selectedRole}` : content.altLinkTo}
            className="font-semibold text-teal-700"
          >
            {content.altLinkLabel}
          </Link>
        </p>
        <Link to={content.secondaryLinkTo} className="font-semibold text-slate-500 transition hover:text-slate-700">
          {content.secondaryLinkLabel}
        </Link>
      </div>

      {variant === 'user' && selectedRole ? <GoogleRoleAuthPanel mode="login" selectedRole={selectedRole} /> : null}
    </div>
  );
}
