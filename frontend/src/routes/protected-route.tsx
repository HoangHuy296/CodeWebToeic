import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../app/providers/auth-provider';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          Dang tai phien dang nhap...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
