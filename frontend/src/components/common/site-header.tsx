import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { exerciseApi } from '../../lib/exercise-api';
import { AvatarDropdown } from './avatar-dropdown';
import { DarkModeToggle } from './dark-mode-toggle';
import { NotificationBell } from './notification-bell';
import { SiteLogo } from './site-logo';
import { useFloatingPanel } from './use-floating-panel';

const navItems = [
  { label: 'Trang chu', to: '/' },
  { label: 'Khoa hoc', to: '/courses' },
  { label: 'Luyen thi', to: '/mock-test' },
  { label: 'Bai viet', to: '/blog' },
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
      className={({ isActive }) =>
        [
          'rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.12)]'
            : 'text-slate-600 hover:bg-white/80 hover:text-slate-950',
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
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const exerciseTopicsQuery = useQuery({
    queryKey: ['header', 'exercise-topics'],
    queryFn: exerciseApi.listTopics,
  });
  const exerciseTopics = exerciseTopicsQuery.data ?? [];
  const {
    isOpen: isExerciseOpen,
    openPanel: openExercisePanel,
    togglePanel: toggleExercisePanel,
    closePanel: closeExercisePanel,
    wrapperProps: exerciseWrapperProps,
  } = useFloatingPanel();
  const isExerciseRoute = location.pathname.startsWith('/exercises');

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(248,250,252,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
        <div className="shrink-0">
          <SiteLogo />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex max-w-full items-center gap-1 rounded-full border border-white/70 bg-white/72 px-2 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            {navItems.slice(0, 2).map((item) => (
              <HeaderLink key={item.to} label={item.label} to={item.to} />
            ))}

            <div className="relative" {...exerciseWrapperProps}>
              <button
                type="button"
                onClick={toggleExercisePanel}
                onMouseEnter={openExercisePanel}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                  isExerciseOpen || isExerciseRoute
                    ? 'border-stroke bg-white text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.12)]'
                    : 'border-transparent bg-transparent text-slate-600 hover:border-stroke hover:bg-white/80 hover:text-slate-950',
                ].join(' ')}
                aria-expanded={isExerciseOpen}
                aria-haspopup="dialog"
              >
                <span>Bai Tap</span>
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className={[
                    'h-3.5 w-3.5 transition',
                    isExerciseOpen ? 'rotate-180 text-slate-800' : 'text-slate-500',
                  ].join(' ')}
                  fill="currentColor"
                >
                  <path d="M5.2 7.5a.75.75 0 0 1 1.06 0L10 11.24l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.56a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>

              {isExerciseOpen ? (
                <div className="absolute left-0 top-full z-50 mt-3 w-[min(92vw,25rem)] rounded-[2rem] border border-stroke bg-white/96 p-4 shadow-[0_26px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4 px-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                        Chu de on tap
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-950">
                        Chon nhanh bo bai tap de vao dung luong luyen tap.
                      </p>
                    </div>
                    <Link
                      to="/exercises"
                      onClick={closeExercisePanel}
                      className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-200"
                    >
                      Tat ca
                    </Link>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {exerciseTopics.map((topic) => (
                      <Link
                        key={topic.slug}
                        to={`/exercises/${topic.slug}`}
                        onClick={closeExercisePanel}
                        className="rounded-[1.3rem] border border-transparent px-4 py-3 transition hover:-translate-y-0.5 hover:border-stroke hover:bg-slate-50"
                      >
                        <p className="text-sm font-bold text-slate-950">{topic.label}</p>
                        <p className="mt-1 text-xs leading-6 text-slate-500">
                          {topic.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {navItems.slice(2).map((item) => (
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
                className="rounded-full border border-stroke bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
              >
                Dang nhap
              </Link>
              <Link
                to="/register"
                className="btn-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Dang ky
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stroke bg-white/85 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:bg-white lg:hidden"
          aria-expanded={isMobileOpen}
          aria-label="Mo menu"
        >
          <MenuIcon isOpen={isMobileOpen} />
        </button>
      </div>

      {isMobileOpen ? (
        <div className="border-t border-stroke/80 bg-white/88 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.slice(0, 2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]'
                      : 'bg-white text-slate-700',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="rounded-[1.5rem] border border-stroke bg-white p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <Link
                to="/exercises"
                onClick={() => setIsMobileOpen(false)}
                className="block rounded-2xl px-3 py-2 text-sm font-bold text-slate-950"
              >
                Bai Tap
              </Link>
              <div className="mt-2 grid gap-2">
                {exerciseTopics.map((topic) => (
                  <Link
                    key={topic.slug}
                    to={`/exercises/${topic.slug}`}
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>
            </div>

            {navItems.slice(2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]'
                      : 'bg-white text-slate-700',
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
                  className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-700"
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
