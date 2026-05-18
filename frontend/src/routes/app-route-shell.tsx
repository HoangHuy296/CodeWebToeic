import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export function AppRouteShell() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDashboardRoute =
    location.pathname === '/student/dashboard' ||
    location.pathname === '/teacher/dashboard' ||
    location.pathname === '/admin/dashboard';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    if (isDashboardRoute) {
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);
    const timer = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [isDashboardRoute, location.pathname, location.search, location.hash]);

  return (
    <>
      <div
        className={[
          'pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden',
          isTransitioning && !isDashboardRoute ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-hidden="true"
      >
        <div className="route-progress-bar h-full w-full" />
      </div>

      <div
        key={`${location.pathname}${location.search}${location.hash}`}
        className={[
          'min-h-screen',
          isDashboardRoute ? '' : 'route-content-enter',
        ].join(' ')}
      >
        <Outlet />
      </div>
    </>
  );
}
