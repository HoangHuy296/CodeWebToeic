import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { getApiErrorMessage } from '../../lib/api';
import { getDefaultRolePath } from '../../routes/path-utils';
import type { AppRole, GoogleAuthRole } from '../../types/auth';
import { GoogleRoleAuthPanel } from './google-role-auth-panel';

interface LoginFormProps {
  variant?: 'user' | 'admin';
  selectedRole?: GoogleAuthRole;
}

const contentMap = {
  user: {
    eyebrow: 'Dang nhap',
    title: 'Ket noi vao workspace cua ban',
    description: 'Form nay ket noi truc tiep den backend auth APIs da duoc test.',
    defaultEmail: 'student1@ivyts.dev',
    defaultPassword: 'Password@123',
    submitLabel: 'Dang nhap',
    altLabel: 'Chua co tai khoan?',
    altLinkLabel: 'Dang ky ngay',
    altLinkTo: '/register',
    secondaryLinkLabel: 'Dang nhap quan tri',
    secondaryLinkTo: '/admin/login',
    allowedRole: null as AppRole | null,
    blockedMessage: 'Tai khoan nay khong thuoc khu vuc nguoi dung thong thuong.',
  },
  admin: {
    eyebrow: 'Admin login',
    title: 'Dang nhap khu vuc quan tri IVYTS 1997',
    description: 'Chi tai khoan admin moi co the truy cap workspace quan tri rieng.',
    defaultEmail: 'admin@ivyts.dev',
    defaultPassword: 'Password@123',
    submitLabel: 'Vao admin dashboard',
    altLabel: 'Muon dang nhap hoc vien hoac giang vien?',
    altLinkLabel: 'Ve trang dang nhap chung',
    altLinkTo: '/login',
    secondaryLinkLabel: 'Quay ve trang chu',
    secondaryLinkTo: '/',
    allowedRole: 'admin' as AppRole,
    blockedMessage: 'Trang dang nhap nay chi danh cho tai khoan admin.',
  },
};

export function LoginForm({ variant = 'user', selectedRole }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const content = contentMap[variant];
  const roleLabels: Record<GoogleAuthRole, string> = {
    student: 'hoc vien',
    teacher: 'giang vien',
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
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{content.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {variant === 'user' && selectedRole
          ? `Ban dang dang nhap voi vai tro ${roleLabels[selectedRole]}.`
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
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Mat khau</span>
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
          {isSubmitting ? 'Dang xu ly...' : content.submitLabel}
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
