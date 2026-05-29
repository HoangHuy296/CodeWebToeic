import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-provider';
import { resolveWebSocketUrl } from '../../lib/notifications';
import { getStoredAccessToken } from '../../lib/storage';
import { notificationApi, type StoredNotification } from '../../lib/notification-api';
import type {
  AppNotification,
  LocalNotificationInput,
  NotificationEnvelope,
} from '../../types/notification';

interface NotificationRecord extends AppNotification {
  isRead: boolean;
  readAt?: string | null;
  source: 'websocket' | 'local';
}

interface NotificationContextValue {
  notifications: NotificationRecord[];
  unreadCount: number;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected';
  pushClientNotification: (input: LocalNotificationInput) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const MAX_NOTIFICATIONS = 30;
const NOTIFICATION_STORAGE_PREFIX = 'ivyts.notifications';

function getNotificationStorageKey(userId: string) {
  return `${NOTIFICATION_STORAGE_PREFIX}:${userId}`;
}

function prependNotification(
  current: NotificationRecord[],
  next: NotificationRecord,
): NotificationRecord[] {
  const deduped = current.filter((item) => item.id !== next.id);
  return [next, ...deduped].slice(0, MAX_NOTIFICATIONS);
}

function normalizeApiNotifications(items: StoredNotification[]): NotificationRecord[] {
  return items.map((item) => ({
    ...item,
    source: 'websocket',
  }));
}

function normalizeStoredNotifications(value: string | null): NotificationRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is NotificationRecord => {
        if (!item || typeof item !== 'object') {
          return false;
        }

        const candidate = item as Partial<NotificationRecord>;
        return (
          typeof candidate.id === 'string' &&
          typeof candidate.title === 'string' &&
          typeof candidate.message === 'string' &&
          typeof candidate.createdAt === 'string' &&
          typeof candidate.isRead === 'boolean'
        );
      })
      .slice(0, MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'disconnected'
  >('idle');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const notificationStorageKey = user?.id ? getNotificationStorageKey(user.id) : null;

  const syncNotificationInbox = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const payload = await notificationApi.list();
      setNotifications(normalizeApiNotifications(payload.items));
    } catch {
      // Keep local cache if the inbox sync fails temporarily.
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!notificationStorageKey) {
      setNotifications([]);
      return;
    }

    setNotifications(normalizeStoredNotifications(window.localStorage.getItem(notificationStorageKey)));
  }, [notificationStorageKey]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    void syncNotificationInbox();
  }, [isAuthenticated, syncNotificationInbox, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const handleVisibilitySync = () => {
      if (document.visibilityState === 'visible') {
        void syncNotificationInbox();
      }
    };

    const handleWindowFocus = () => {
      void syncNotificationInbox();
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilitySync);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilitySync);
    };
  }, [isAuthenticated, syncNotificationInbox, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionStatus('idle');
      setNotifications([]);
      return;
    }

    const accessToken = getStoredAccessToken();
    const socketUrl = accessToken ? resolveWebSocketUrl(accessToken) : null;

    if (!socketUrl) {
      setConnectionStatus('disconnected');
      return;
    }

    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) {
        return;
      }

      setConnectionStatus('connecting');
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isUnmounted) {
          setConnectionStatus('connected');
          void syncNotificationInbox();
        }
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as NotificationEnvelope;

        if (data.type === 'notification') {
          const payload = data.payload as AppNotification;
          setNotifications((current) =>
            prependNotification(current, {
              ...payload,
              isRead: false,
              source: 'websocket',
            }),
          );
        }
      };

      socket.onclose = () => {
        if (isUnmounted) {
          return;
        }

        setConnectionStatus('disconnected');
        reconnectTimerRef.current = window.setTimeout(connect, 2500);
      };

      socket.onerror = () => {
        if (!isUnmounted) {
          setConnectionStatus('disconnected');
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, syncNotificationInbox, user]);

  useEffect(() => {
    if (!notificationStorageKey) {
      return;
    }

    window.localStorage.setItem(notificationStorageKey, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  }, [notificationStorageKey, notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      connectionStatus,
      pushClientNotification: (input) => {
        setNotifications((current) =>
          prependNotification(current, {
            id: `local-${crypto.randomUUID()}`,
            title: input.title,
            message: input.message,
            severity: input.severity,
            entityType: input.entityType,
            channel: 'local',
            createdAt: new Date().toISOString(),
            metadata: input.metadata,
            isRead: false,
            source: 'local',
          }),
        );
      },
      markAsRead: (notificationId) => {
        void notificationApi.markAsRead(notificationId).catch(() => {
          // Keep optimistic UI state even if the request fails briefly.
        });
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() } : item,
          ),
        );
      },
      markAllAsRead: () => {
        void notificationApi.markAllAsRead().catch(() => {
          // Keep optimistic UI state even if the request fails briefly.
        });
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() })));
      },
      clearNotifications: () => {
        void notificationApi.clear().catch(() => {
          // Keep optimistic UI state even if the request fails briefly.
        });
        setNotifications([]);
      },
    }),
    [connectionStatus, notifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
}
