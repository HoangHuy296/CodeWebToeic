import type { AppRole } from './auth';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type NotificationEntityType =
  | 'profile'
  | 'enrollment'
  | 'course'
  | 'post'
  | 'auth'
  | 'message'
  | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  entityType: NotificationEntityType;
  channel: 'local' | 'system';
  createdAt: string;
  actorRole?: Exclude<AppRole, 'guest'>;
  actorUserId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface NotificationEnvelope {
  type: 'connected' | 'notification';
  payload: Record<string, unknown> | AppNotification;
}

export interface LocalNotificationInput {
  title: string;
  message: string;
  severity: NotificationSeverity;
  entityType: NotificationEntityType;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}
