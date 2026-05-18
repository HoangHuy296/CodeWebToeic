import {
  createContext,
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
import type {
  AppNotification,
  LocalNotificationInput,
  NotificationEnvelope,
} from '../../types/notification';

interface NotificationRecord extends AppNotification {
  isRead: boolean;
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

function prependNotification(
  current: NotificationRecord[],
  next: NotificationRecord,
): NotificationRecord[] {
  const deduped = current.filter((item) => item.id !== next.id);
  return [next, ...deduped].slice(0, MAX_NOTIFICATIONS);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'disconnected'
  >('idle');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

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
  }, [isAuthenticated, user]);

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
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item,
          ),
        );
      },
      markAllAsRead: () => {
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      },
      clearNotifications: () => {
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
