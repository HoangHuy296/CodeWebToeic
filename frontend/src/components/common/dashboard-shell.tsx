import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export interface DashboardNavItem {
  label: string;
  to: string;
  children?: DashboardNavItem[];
}

interface DashboardShellProps {
  title: string;
  accent: string;
  navItems: DashboardNavItem[];
}

export function DashboardShell({ title, accent, navItems }: DashboardShellProps) {
  const location = useLocation();
  const activeNavClasses = 'dashboard-nav-active';
  const activeChildNavClasses = 'dashboard-nav-active';
  const inactiveNavClasses = 'text-slate-600 hover:bg-slate-50 hover:text-slate-950';
  const initialExpanded = useMemo(() => {
    const expandedParents = navItems
      .filter((item) => item.children?.some((child) => location.pathname.startsWith(child.to)))
      .map((item) => item.to);
    return new Set(expandedParents);
  }, [location.pathname, navItems]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(initialExpanded);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="surface-card rounded-[1.5rem] p-5">
        <div className="brand-panel rounded-xl p-5">
          <p className="panel-eyebrow text-xs font-semibold tracking-[0.3em] uppercase">{accent}</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{title}</h2>
        </div>

        <nav className="mt-4 grid gap-2">
          {navItems.map((item) => (
            <div key={item.to} className="grid gap-2">
              <div className="flex items-center gap-2">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'min-w-0 flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition',
                      isActive || item.children?.some((child) => location.pathname.startsWith(child.to))
                        ? activeNavClasses
                        : inactiveNavClasses,
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>

                {item.children?.length ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedItems((current) => {
                        const next = new Set(current);

                        if (next.has(item.to)) {
                          next.delete(item.to);
                        } else {
                          next.add(item.to);
                        }

                        return next;
                      })
                    }
                    className={[
                      'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stroke text-sm font-extrabold transition',
                      expandedItems.has(item.to) || item.children?.some((child) => location.pathname.startsWith(child.to))
                        ? 'dashboard-nav-active'
                        : 'bg-white text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {expandedItems.has(item.to) ? '-' : '+'}
                  </button>
                ) : null}
              </div>

              {item.children?.length && expandedItems.has(item.to) ? (
                <div className="ml-4 grid gap-2 border-l border-stroke pl-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        [
                          'rounded-lg px-4 py-3 text-sm font-semibold transition',
                          isActive ? activeChildNavClasses : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
                        ].join(' ')
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
