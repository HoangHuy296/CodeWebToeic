import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useAuth } from "../../app/providers/auth-provider";
import { useFloatingPanel } from "./use-floating-panel";

interface RoleNavItem {
  label: string;
  to: string;
  children?: RoleNavItem[];
}

function useRoleLinks(t: TFunction<'navigation'>): Record<"student" | "teacher" | "admin", RoleNavItem[]> {
  return {
  student: [
    { label: t('common.dashboard'), to: "/student/dashboard" },
    { label: t('common.profile'), to: "/student/profile" },
    { label: t('common.messages'), to: "/student/messages" },
    { label: t('student.myCourses'), to: "/student/my-courses" },
    { label: t('student.results'), to: "/student/results" },
    { label: t('student.mockTests'), to: "/student/mock-tests" },
    { label: t('common.settings'), to: "/student/settings" },
  ],
  teacher: [
    { label: t('common.dashboard'), to: "/teacher/dashboard" },
    { label: t('common.profile'), to: "/teacher/profile" },
    { label: t('teacher.courses'), to: "/teacher/courses" },
    { label: t('teacher.exercises'), to: "/teacher/exercises/items" },
    { label: t('teacher.mockTests'), to: "/teacher/mock-tests" },
    { label: t('teacher.results'), to: "/teacher/results" },
    { label: t('teacher.students'), to: "/teacher/students" },
    { label: t('common.messages'), to: "/teacher/messages" },
    { label: t('common.settings'), to: "/teacher/settings" },
  ],
  admin: [
    { label: t('common.dashboard'), to: "/admin/dashboard" },
    { label: t('admin.users'), to: "/admin/users" },
    { label: t('admin.courses'), to: "/admin/courses" },
    { label: t('admin.mockTests'), to: "/admin/mock-tests" },
    { label: t('admin.exercises'), to: "/admin/exercises" },
    { label: t('admin.results'), to: "/admin/results" },
    { label: t('admin.posts'), to: "/admin/posts" },
    { label: t('common.messages'), to: "/admin/messages" },
    { label: t('admin.accountSettings'), to: "/admin/account-settings" },
  ],
  };
}

export function AvatarDropdown() {
  const { t } = useTranslation('navigation');
  const { user, logout } = useAuth();
  const { isOpen, togglePanel, closePanel, wrapperProps } = useFloatingPanel();
  const roleLinks = useRoleLinks(t);

  const initials = useMemo(() => {
    if (!user) {
      return "IV";
    }

    return user.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user]);

  if (!user) {
    return null;
  }

  const normalizedRole = user.role.toLowerCase() as keyof typeof roleLinks;
  const workspaceLinks = roleLinks[normalizedRole] ?? [];

  return (
    <div className="relative" {...wrapperProps}>
      <button
        type="button"
        onClick={togglePanel}
        className={[
          "group inline-flex items-center gap-3 rounded-full border border-stroke bg-white/88 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition",
          isOpen
            ? "translate-y-0 shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
            : "hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]",
        ].join(" ")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="brand-mark relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-stroke">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-white">{initials}</span>
          )}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold text-slate-950">
            {user.fullName}
          </span>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-slate-500">
            {user.role} workspace
          </span>
        </span>
        <span
          className={[
            "hidden text-slate-400 transition sm:block",
            isOpen ? "rotate-180 text-slate-700" : "group-hover:text-slate-600",
          ].join(" ")}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
            <path d="M5.2 7.5a.75.75 0 0 1 1.06 0L10 11.24l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.56a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-40 mt-3 w-[min(88vw,22rem)] rounded-[2rem] border border-stroke bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <div className="surface-soft rounded-xl px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="brand-mark inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-stroke">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-base font-bold text-white">
                    {initials}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-950">
                  {user.fullName}
                </p>
                <p className="truncate text-sm text-slate-600">{user.email}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-500">
              {normalizedRole}
            </p>
          </div>

          <div className="mt-3 grid gap-2">
            {workspaceLinks.map((item) => (
              <div key={item.to} className="grid gap-1">
                <Link
                  to={item.to}
                  onClick={closePanel}
                  className="flex items-center justify-between rounded-[1.2rem] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <span>{item.label}</span>
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400"
                    fill="currentColor"
                  >
                    <path d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </Link>

                {item.children?.length ? (
                  <div className="ml-4 grid gap-1 border-l border-stroke pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={closePanel}
                        className="flex items-center justify-between rounded-[1rem] bg-slate-50/85 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <span>{child.label}</span>
                        <span className="rounded-full bg-teal-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800">
                          Tool
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={async () => {
              closePanel();
              await logout();
            }}
            className="btn-brand mt-3 w-full rounded-[1.2rem] px-4 py-3 text-sm font-semibold text-white"
          >
            {t('common.logout')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
