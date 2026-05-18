import { UserRole } from './auth.js';

export type NotificationRole = Exclude<UserRole, 'guest'>;
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'local' | 'system';
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
  channel: NotificationChannel;
  entityType: NotificationEntityType;
  createdAt: string;
  actorRole?: NotificationRole;
  actorUserId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface NotificationDispatchInput {
  title: string;
  message: string;
  severity: NotificationSeverity;
  channel?: NotificationChannel;
  entityType: NotificationEntityType;
  actorRole?: NotificationRole;
  actorUserId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  roles?: NotificationRole[];
  userIds?: string[];
  excludeUserIds?: string[];
}
