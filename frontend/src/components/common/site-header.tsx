import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../app/providers/auth-provider";
import { AvatarDropdown } from "./avatar-dropdown";
import { DarkModeToggle } from "./dark-mode-toggle";
import { NotificationBell } from "./notification-bell";
import { SiteLogo } from "./site-logo";

const navItems = [
  { label: "Trang chu", to: "/" },
  { label: "Khoa hoc", to: "/courses" },
  { label: "Luyen thi", to: "/mock-test" },
  { label: "Bai viet", to: "/blog" },
  { label: "Lien he", to: "/portfolio" },
];

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-[rgba(249,250,251,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <SiteLogo />

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
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
                className="rounded-full border border-stroke px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stroke bg-white lg:hidden"
        >
          <span className="text-lg font-bold text-slate-900">
            {isMobileOpen ? "x" : "="}
          </span>
        </button>
      </div>

      {isMobileOpen ? (
        <div className="border-t border-stroke px-5 py-4 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl border border-stroke px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Dang nhap
                </Link>
                <Link
                  to="/register"
                  className="btn-brand rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                >
                  Dang ky
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
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
