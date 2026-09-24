import { useMemo, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/providers/auth-provider';
import { getApiErrorCode, getApiErrorMessage } from '../../lib/api';
import { getDefaultRolePath } from '../../routes/path-utils';
import type { GoogleAuthRole } from '../../types/auth';

interface GoogleRoleAuthPanelProps {
  mode: 'login' | 'register';
  selectedRole: GoogleAuthRole;
}

export function GoogleRoleAuthPanel({ mode, selectedRole }: GoogleRoleAuthPanelProps) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  const helperMessage = useMemo(() => {
    if (!googleClientId) {
      return t('google.notConfigured');
    }

    return null;
  }, [googleClientId, t]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError(t('google.invalidCredential'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = await loginWithGoogle({
        credential: credentialResponse.credential,
        intendedRole: selectedRole,
      });

      navigate(redirectTo ?? getDefaultRolePath(user.role), { replace: true });
    } catch (submitError) {
      const errorCode = getApiErrorCode(submitError);
      if (errorCode === 'GOOGLE_LINK_REQUIRED') {
        setError(t('google.linkRequired'));
      } else if (errorCode === 'GOOGLE_ROLE_MISMATCH') {
        setError(t('google.roleMismatch'));
      } else if (errorCode === 'GOOGLE_ROLE_NOT_ALLOWED') {
        setError(t('google.adminNotAllowed'));
      } else {
        setError(getApiErrorMessage(submitError));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="surface-soft mt-8 rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">{t('google.eyebrow')}</p>
          <h3 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950">
            {mode === 'register' ? t('google.titleRegister') : t('google.titleLogin')}
          </h3>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          {selectedRole}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {helperMessage ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {helperMessage}
          </p>
        ) : (
          <div className={isSubmitting ? 'pointer-events-none opacity-70' : ''}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError(t('google.loginFailed'))}
              theme="outline"
              size="large"
              text={mode === 'register' ? 'signup_with' : 'signin_with'}
              shape="pill"
              width="340"
            />
          </div>
        )}

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
