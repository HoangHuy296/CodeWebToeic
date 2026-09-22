import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { AvatarDropdown } from './avatar-dropdown';
import { DarkModeToggle } from './dark-mode-toggle';
import { NotificationBell } from './notification-bell';
import { SiteLogo } from './site-logo';

/**
 * The main nav is intentionally short. Older sections (Khoa hoc, Bai Tap, Luyen thi, Bai viet)
 * keep their routes in `router.tsx` for later — they are just not linked from here right now.
 */
const navItems = [
  { label: 'Trang chu', to: '/' },
  { label: 'Kiem tra', to: '/wordcheck' },
  { label: 'On tap', to: '/review' },
  { label: 'Lien he', to: '/portfolio' },
];

function HeaderLink({
  label,
  to,
}: {
  label: string;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'site-nav-link px-4 py-2.5 text-sm font-medium transition',
          isActive ? 'font-semibold' : '',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-slate-900"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {isOpen ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-stroke backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
        <div className="shrink-0">
          <SiteLogo />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex max-w-full items-center gap-1">
            {navItems.map((item) => (
              <HeaderLink key={item.to} label={item.label} to={item.to} />
            ))}
          </div>
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <DarkModeToggle />
              <AvatarDropdown />
            </>
          ) : (
            <>
              <DarkModeToggle />
              <Link
                to="/login"
                className="btn-secondary px-5 py-2.5 text-sm"
              >
                Dang nhap
              </Link>
              <Link
                to="/register"
                className="btn-brand px-5 py-2.5 text-sm"
              >
                Dang ky
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="btn-secondary ml-auto h-11 w-11 lg:hidden"
          aria-expanded={isMobileOpen}
          aria-label="Mo menu"
        >
          <MenuIcon isOpen={isMobileOpen} />
        </button>
      </div>

      {isMobileOpen ? (
        <div className="border-t border-stroke/80 bg-white/88 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'site-nav-link px-4 py-3 text-sm transition',
                    isActive ? 'font-semibold' : 'font-medium',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="btn-secondary px-4 py-3 text-sm"
                >
                  Dang nhap
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileOpen(false)}
                  className="btn-brand rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                >
                  Dang ky
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-stroke bg-white p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                <NotificationBell />
                <DarkModeToggle />
                <AvatarDropdown />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
