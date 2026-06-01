import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthRoleSelector } from '../../components/auth/auth-role-selector';
import { LoginForm } from '../../components/auth/login-form';
import type { GoogleAuthRole } from '../../types/auth';

function parseRole(value: string | null): GoogleAuthRole | null {
  return value === 'student' || value === 'teacher' ? value : null;
}

export function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = useMemo(() => parseRole(searchParams.get('role')), [searchParams]);
  const [selectedRole, setSelectedRole] = useState<GoogleAuthRole | null>(initialRole);
  const [hasContinued, setHasContinued] = useState<boolean>(Boolean(initialRole));

  if (!hasContinued || !selectedRole) {
    return (
      <AuthRoleSelector
        mode="login"
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

  return <LoginForm variant="user" selectedRole={selectedRole} />;
}
