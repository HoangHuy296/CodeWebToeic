import { api, unwrapResponse } from './api';
import type { AppNotification } from '../types/notification';

export interface StoredNotification extends AppNotification {
  isRead: boolean;
  readAt?: string | null;
}

export interface NotificationListPayload {
  items: StoredNotification[];
  unreadCount: number;
}

export const notificationApi = {
  list: () =>
    unwrapResponse<NotificationListPayload>(api.get('/notifications')),
  markAsRead: (notificationId: string) =>
    unwrapResponse<StoredNotification>(api.patch(`/notifications/${notificationId}/read`)),
  markAllAsRead: () =>
    unwrapResponse<{ updatedCount: number }>(api.patch('/notifications/read-all')),
  clear: () =>
    unwrapResponse<{ cleared: boolean }>(api.delete('/notifications')),
};
