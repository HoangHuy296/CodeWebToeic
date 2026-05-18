import { useTheme } from '../../app/providers/theme-provider';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-stroke text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      aria-label={isDark ? 'Chuyen sang light mode' : 'Chuyen sang dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-fuchsia-100" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4.3" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-violet-700" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
