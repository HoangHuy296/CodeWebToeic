import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../app/providers/auth-provider';
import { getDefaultRolePath } from './path-utils';

export function AuthRedirectRoute() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDefaultRolePath(role)} replace />;
  }

  return <Outlet />;
}

