import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../app/providers/auth-provider';
import type { AppRole } from '../types/auth';
import { getDefaultRolePath } from './path-utils';

export function RoleBasedRoute({ allowedRoles }: { allowedRoles: Exclude<AppRole, 'guest'>[] }) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role as Exclude<AppRole, 'guest'>)) {
    return <Navigate to={getDefaultRolePath(role)} replace />;
  }

  return <Outlet />;
}

