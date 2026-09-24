import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { i18n } from '../../i18n';
import type { LanguageCode } from '../../types/auth';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface LanguageContextValue {
  language: LanguageCode;
  saveStatus: SaveStatus;
  changeLanguage: (language: LanguageCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const GUEST_KEY = 'ivyts.language.guest';
const LEGACY_GUEST_KEY = 'ivyts-language';

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === 'vi' || value === 'en';
}

function userCacheKey(userId: string) {
  return `ivyts.language.user:${userId}`;
}

/**
 * Guest (or not-yet-resolved) language for this browser. One-time migration: the placeholder
 * Language tab used to write a plain `ivyts-language` key with no server persistence — that key
 * is read once as a hint, never treated as anyone's saved account preference.
 */
function loadGuestLanguage(): LanguageCode {
  try {
    const stored = window.localStorage.getItem(GUEST_KEY);
    if (isLanguageCode(stored)) return stored;

    const legacy = window.localStorage.getItem(LEGACY_GUEST_KEY);
    if (isLanguageCode(legacy)) {
      window.localStorage.setItem(GUEST_KEY, legacy);
      return legacy;
    }
  } catch {
    // localStorage unavailable (private mode, blocked storage) — fall back silently.
  }
  return 'vi';
}

function saveGuestLanguage(language: LanguageCode) {
  try {
    window.localStorage.setItem(GUEST_KEY, language);
  } catch {
    // Nothing to persist to if storage is blocked; the in-memory language still applies.
  }
}

function loadUserLanguageCache(userId: string): LanguageCode | null {
  try {
    const stored = window.localStorage.getItem(userCacheKey(userId));
    return isLanguageCode(stored) ? stored : null;
  } catch {
    return null;
  }
}

function saveUserLanguageCache(userId: string, language: LanguageCode) {
  try {
    window.localStorage.setItem(userCacheKey(userId), language);
  } catch {
    // Same as above — the account is still the source of truth on the server.
  }
}

function applyLanguage(language: LanguageCode) {
  void i18n.changeLanguage(language);
  document.documentElement.lang = language;
}

/**
 * Sits between AuthProvider and NotificationProvider (see docs/language-en-vi-plan.md): it
 * reads the signed-in account's `preferredLanguage` once auth resolves, falls back to a
 * per-browser guest choice otherwise, and is the only thing that calls `i18n.changeLanguage` —
 * i18next itself stays the single source of truth for "current language" everywhere else.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isAuthLoading, updatePreferredLanguage } = useAuth();
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const initial = loadGuestLanguage();
    applyLanguage(initial);
    return initial;
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Tracks whose preference is currently applied, so we only re-apply on an actual account
  // change (login/logout/switch) — not on every unrelated re-render.
  const appliedForUserId = useRef<string | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      if (appliedForUserId.current === user.id) return;
      appliedForUserId.current = user.id;
      const next = loadUserLanguageCache(user.id) ?? user.preferredLanguage;
      setLanguage(next);
      applyLanguage(next);
      saveUserLanguageCache(user.id, next);
    } else {
      if (appliedForUserId.current === null) return;
      appliedForUserId.current = null;
      const next = loadGuestLanguage();
      setLanguage(next);
      applyLanguage(next);
    }
  }, [user, isAuthLoading]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      saveStatus,
      changeLanguage: async (next) => {
        const previous = language;
        setLanguage(next);
        applyLanguage(next);

        if (!user) {
          saveGuestLanguage(next);
          setSaveStatus('idle');
          return;
        }

        const seq = ++requestSeq.current;
        const userId = user.id;
        setSaveStatus('saving');
        try {
          await updatePreferredLanguage(userId, next);
          if (seq !== requestSeq.current || appliedForUserId.current !== userId) return;
          saveUserLanguageCache(userId, next);
          setSaveStatus('saved');
        } catch (error) {
          if (seq !== requestSeq.current || appliedForUserId.current !== userId) return;
          setLanguage(previous);
          applyLanguage(previous);
          setSaveStatus('error');
          throw error;
        }
      },
    }),
    [language, saveStatus, user, updatePreferredLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
