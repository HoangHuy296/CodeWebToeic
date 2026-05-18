import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers/auth-provider";
import { useFloatingPanel } from "./use-floating-panel";

interface RoleNavItem {
  label: string;
  to: string;
  children?: RoleNavItem[];
}

const roleLinks: Record<"student" | "teacher" | "admin", RoleNavItem[]> = {
  student: [
    { label: "Dashboard", to: "/student/dashboard" },
    { label: "Ho so", to: "/student/profile" },
    { label: "Tin nhan", to: "/student/messages" },
    { label: "Khoa hoc cua toi", to: "/student/my-courses" },
    { label: "Luyen thi", to: "/student/mock-tests" },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard" },
    { label: "Khoa hoc", to: "/teacher/courses" },
    { label: "Mock tests", to: "/teacher/mock-tests" },
    { label: "Hoc vien", to: "/teacher/students" },
    { label: "Tin nhan", to: "/teacher/messages" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Nguoi dung", to: "/admin/users" },
    {
      label: "Khoa hoc",
      to: "/admin/courses",
    },
    {
      label: "Mock tests",
      to: "/admin/mock-tests",
    },
    { label: "Posts", to: "/admin/posts" },
    { label: "Messages", to: "/admin/messages" },
    { label: "Settings", to: "/admin/settings" },
  ],
};

export function AvatarDropdown() {
  const { user, logout } = useAuth();
  const { isOpen, togglePanel, closePanel, wrapperProps } = useFloatingPanel();

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

  const workspaceLinks = roleLinks[user.role];

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
        <span className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 shadow-[0_12px_26px_rgba(14,116,144,0.22)]">
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
          <div className="rounded-[1.5rem] border border-stroke bg-[linear-gradient(135deg,rgba(45,212,191,0.12),rgba(96,165,250,0.08))] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 shadow-[0_14px_32px_rgba(14,116,144,0.22)]">
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
              {user.role}
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
            Dang xuat
          </button>
        </div>
      ) : null}
    </div>
  );
}
