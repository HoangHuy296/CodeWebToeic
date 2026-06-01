import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../lib/auth-api';
import { clearStoredAuthTokens, getStoredAccessToken, getStoredRefreshToken, storeAuthTokens } from '../../lib/storage';
import { getApiErrorMessage, isUnauthorizedError } from '../../lib/api';
import type { AppRole, AuthPayload, GoogleAuthInput, LoginInput, PublicUser, RegisterInput } from '../../types/auth';

interface AuthContextValue {
  user: PublicUser | null;
  role: AppRole;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (payload: LoginInput) => Promise<PublicUser>;
  loginWithGoogle: (payload: GoogleAuthInput) => Promise<PublicUser>;
  register: (payload: RegisterInput) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<PublicUser | null>;
  syncAuthPayload: (payload: AuthPayload) => PublicUser;
  syncCurrentUser: (user: PublicUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ME_QUERY_KEY = ['auth', 'me'];

function normalizeRole(role: string | undefined | null): AppRole {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === 'student' || normalizedRole === 'teacher' || normalizedRole === 'admin') {
    return normalizedRole;
  }

  return 'guest';
}

function normalizeUser(user: PublicUser): PublicUser {
  return {
    ...user,
    role: normalizeRole(user.role) as PublicUser['role'],
  };
}

function persistAuth(payload: AuthPayload): PublicUser {
  storeAuthTokens(payload.accessToken, payload.refreshToken);
  return normalizeUser(payload.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean>(() => Boolean(getStoredAccessToken()));

  const meQuery = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    enabled: hasSession,
    retry: false,
    queryFn: async () => {
      try {
        const currentUser = await authApi.me();
        return normalizeUser(currentUser);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          const refreshToken = getStoredRefreshToken();

          if (refreshToken) {
            const refreshed = await authApi.refreshToken(refreshToken);
            setHasSession(true);
            return persistAuth(refreshed);
          }
        }

        clearStoredAuthTokens();
        setHasSession(false);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (meQuery.error) {
      setAuthError(getApiErrorMessage(meQuery.error));
    }
  }, [meQuery.error]);

  const clearAuthState = () => {
    clearStoredAuthTokens();
    setHasSession(false);
    setAuthError(null);
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
  };

  const handleAuthSuccess = (payload: AuthPayload) => {
    const user = persistAuth(payload);
    setHasSession(true);
    setAuthError(null);
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, user);
    return user;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      role: meQuery.data?.role ?? 'guest',
      isAuthenticated: Boolean(meQuery.data),
      isAuthLoading: hasSession && meQuery.isPending,
      authError,
      login: async (payload) => {
        const response = await authApi.login(payload);
        return handleAuthSuccess(response);
      },
      loginWithGoogle: async (payload) => {
        const response = await authApi.google(payload);
        return handleAuthSuccess(response);
      },
      register: async (payload) => {
        const response = await authApi.register(payload);
        return handleAuthSuccess(response);
      },
      logout: async () => {
        const refreshToken = getStoredRefreshToken();

        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } finally {
          clearAuthState();
        }
      },
      refreshCurrentUser: async () => {
        if (!getStoredAccessToken()) {
          clearAuthState();
          return null;
        }

        const user = await queryClient.fetchQuery({
          queryKey: AUTH_ME_QUERY_KEY,
          queryFn: async () => normalizeUser(await authApi.me()),
        });

        queryClient.setQueryData(AUTH_ME_QUERY_KEY, user);
        return user;
      },
      syncAuthPayload: (payload) => handleAuthSuccess(payload),
      syncCurrentUser: (user) => {
        setHasSession(true);
        setAuthError(null);
        queryClient.setQueryData(AUTH_ME_QUERY_KEY, normalizeUser(user));
      },
    }),
    [authError, hasSession, meQuery.data, meQuery.isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
