import { useMemo, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { getApiErrorCode, getApiErrorMessage } from '../../lib/api';
import { getDefaultRolePath } from '../../routes/path-utils';
import type { GoogleAuthRole } from '../../types/auth';

interface GoogleRoleAuthPanelProps {
  mode: 'login' | 'register';
  selectedRole: GoogleAuthRole;
}

export function GoogleRoleAuthPanel({ mode, selectedRole }: GoogleRoleAuthPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  const helperMessage = useMemo(() => {
    if (!googleClientId) {
      return 'Google sign-in chua duoc cau hinh. Bo sung VITE_GOOGLE_CLIENT_ID de hien nut dang nhap Google.';
    }

    return null;
  }, [googleClientId]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google khong tra ve credential hop le.');
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
        setError('Email nay da ton tai. Hay dang nhap bang mat khau truoc, sau do lien ket Google o phase sau.');
      } else if (errorCode === 'GOOGLE_ROLE_MISMATCH') {
        setError('Email nay da gan voi mot role khac. Hay chon dung role hoac dang nhap bang cach hien co.');
      } else if (errorCode === 'GOOGLE_ROLE_NOT_ALLOWED') {
        setError('Tai khoan admin khong duoc dang nhap bang Google trong phase nay.');
      } else {
        setError(getApiErrorMessage(submitError));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-[2rem] border border-stroke bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(236,253,245,0.92),rgba(239,246,255,0.94))] p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">google sign-in</p>
          <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950">
            {mode === 'register' ? 'Dang ky bang Google' : 'Dang nhap bang Google'}
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
              onError={() => setError('Google sign-in that bai. Hay thu lai.')}
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
