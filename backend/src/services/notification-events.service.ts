// High-level domain events are translated here into bell-notification language and routing metadata.
import type { AuthUser } from '../types/auth.js';
import type { NotificationRole } from '../types/notification.js';
import { dispatchNotification, notifyRoles, notifyUsers } from './notification.service.js';

function resolveActorRole(actor: AuthUser): NotificationRole {
  return actor.role as NotificationRole;
}

function baseMetadata(actor: AuthUser) {
  return {
    actorEmail: actor.email,
    actorRole: actor.role,
  };
}

export function emitProfileUpdated(actor: AuthUser, subject: 'profile' | 'email' | 'phone' | 'password'): void {
  notifyUsers([actor.userId], {
    title: 'Cap nhat thong tin thanh cong',
    message:
      subject === 'password'
        ? 'Mat khau da duoc cap nhat thanh cong.'
        : `Thong tin ${subject} da duoc cap nhat thanh cong.`,
    severity: 'success',
    entityType: 'profile',
    actorRole: resolveActorRole(actor),
    actorUserId: actor.userId,
    metadata: {
      subject,
      ...baseMetadata(actor),
    },
  });
}

export function emitActionFailure(actor: AuthUser, title: string, message: string, entityType: 'profile' | 'enrollment' | 'course' | 'post'): void {
  notifyUsers([actor.userId], {
    title,
    message,
    severity: 'error',
    entityType,
    actorRole: resolveActorRole(actor),
    actorUserId: actor.userId,
    metadata: baseMetadata(actor),
  });
}

export function emitNewUserRegistered(userId: string, email: string, fullName: string): void {
  notifyUsers([userId], {
    title: 'Dang ky thanh cong',
    message: 'Tai khoan hoc vien da duoc tao va san sang su dung.',
    severity: 'success',
    entityType: 'auth',
    actorRole: 'student',
    actorUserId: userId,
    metadata: { email, fullName },
  });

  notifyRoles(['admin'], {
    title: 'Co user moi dang ky',
    message: `${fullName} vua tao tai khoan moi voi email ${email}.`,
    severity: 'info',
    entityType: 'system',
    actorRole: 'student',
    actorUserId: userId,
    metadata: { email, fullName },
  });
}

export function emitCourseStatusChanged(
  actor: AuthUser,
  course: { id: string; slug: string; title: string; isPublished: boolean; ownerId: string },
  transition: 'created' | 'published' | 'draft' | 'updated' | 'changes_requested' | 'rejected',
): void {
  const actorTitle =
    transition === 'created'
      ? 'Tao khoa hoc thanh cong'
      : transition === 'published'
        ? 'Xuat ban khoa hoc thanh cong'
        : transition === 'draft'
          ? 'Chuyen khoa hoc ve draft'
          : transition === 'changes_requested'
            ? 'Yeu cau giang vien chinh sua'
            : transition === 'rejected'
              ? 'Tu choi khoa hoc'
          : 'Cap nhat khoa hoc thanh cong';
  const statusMessage =
    transition === 'published'
      ? `Khoa hoc "${course.title}" da duoc xuat ban thanh cong.`
      : transition === 'draft'
        ? `Khoa hoc "${course.title}" da duoc chuyen ve nhap.`
        : transition === 'changes_requested'
          ? `Admin da yeu cau giang vien chinh sua khoa hoc "${course.title}".`
          : transition === 'rejected'
            ? `Khoa hoc "${course.title}" da bi tu choi.`
        : transition === 'created'
          ? `Khoa hoc "${course.title}" da duoc tao thanh cong.`
          : actor.role === 'teacher' && !course.isPublished
            ? `Khoa hoc "${course.title}" da duoc cap nhat va gui lai admin de phe duyet.`
            : `Khoa hoc "${course.title}" da duoc cap nhat thanh cong.`;

  notifyUsers([actor.userId], {
    title: actorTitle,
    message:
      transition === 'created' && actor.role === 'teacher'
        ? `Khoa hoc "${course.title}" da duoc tao o trang thai draft va da gui admin de phe duyet.`
        : statusMessage,
    severity: 'success',
    entityType: 'course',
    actorRole: resolveActorRole(actor),
    actorUserId: actor.userId,
    metadata: {
      courseId: course.id,
      courseTitle: course.title,
      isPublished: course.isPublished,
      transition,
      actionPath:
        actor.role === 'teacher'
          ? `/courses/${course.slug}`
          : actor.role === 'admin'
            ? `/admin/courses`
            : undefined,
      ...baseMetadata(actor),
    },
  });

  if (actor.role === 'admin' && course.ownerId !== actor.userId && transition !== 'created') {
    notifyUsers([course.ownerId], {
      title: actorTitle,
      message: statusMessage,
      severity:
        transition === 'rejected'
          ? 'error'
          : transition === 'changes_requested'
            ? 'warning'
            : 'success',
      entityType: 'course',
      actorRole: resolveActorRole(actor),
      actorUserId: actor.userId,
      metadata: {
        courseId: course.id,
        courseTitle: course.title,
        isPublished: course.isPublished,
        transition,
        actionPath: `/courses/${course.slug}`,
        ...baseMetadata(actor),
      },
    });
  }

  notifyRoles(['admin'], {
    title:
      transition === 'created' && actor.role === 'teacher'
        ? 'Giang vien vua tao khoa hoc moi'
        : transition === 'updated' && actor.role === 'teacher' && !course.isPublished
          ? 'Giang vien da gui lai khoa hoc de phe duyet'
        : transition === 'created'
          ? 'Co khoa hoc moi duoc tao'
        : transition === 'published'
          ? 'Khoa hoc da duoc xuat ban'
          : transition === 'draft'
            ? 'Khoa hoc da chuyen ve draft'
            : 'Khoa hoc da duoc cap nhat',
    message:
      transition === 'created' && actor.role === 'teacher'
        ? `Giang vien vua tao khoa hoc "${course.title}" o trang thai draft. Admin can review, chinh sua hoac publish.`
        : transition === 'updated' && actor.role === 'teacher' && !course.isPublished
          ? `Giang vien da cap nhat khoa hoc "${course.title}" va gui lai admin de phe duyet.`
        : transition === 'created'
          ? `Khoa hoc "${course.title}" vua duoc tao thanh cong.`
          : transition === 'changes_requested'
            ? `Admin da yeu cau giang vien chinh sua khoa hoc "${course.title}".`
            : transition === 'rejected'
              ? `Khoa hoc "${course.title}" da bi tu choi.`
        : `${course.title} hien dang o trang thai ${course.isPublished ? 'published' : 'draft'}.`,
    severity: course.isPublished ? 'success' : 'warning',
    entityType: 'course',
    actorRole: resolveActorRole(actor),
    actorUserId: actor.userId,
    excludeUserIds: actor.role === 'admin' ? [actor.userId] : undefined,
    metadata: {
      courseId: course.id,
      courseTitle: course.title,
      isPublished: course.isPublished,
      transition,
      ownerId: course.ownerId,
      actionPath: `/admin/courses`,
      ...baseMetadata(actor),
    },
  });
}

export function emitEnrollmentCreated(input: {
  studentUserId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  ownerId: string;
  ownerRole?: NotificationRole;
}): void {
  notifyUsers([input.studentUserId], {
    title: 'Dang ky khoa hoc thanh cong',
    message: `Ban da dang ky thanh cong khoa hoc "${input.courseTitle}".`,
    severity: 'success',
    entityType: 'enrollment',
    actorRole: 'student',
    actorUserId: input.studentUserId,
    metadata: {
      courseId: input.courseId,
      courseTitle: input.courseTitle,
    },
  });

  notifyUsers([input.ownerId], {
    title: 'Co hoc vien moi enroll',
    message: `${input.studentName} vua dang ky vao khoa hoc "${input.courseTitle}".`,
    severity: 'info',
    entityType: 'enrollment',
    actorRole: 'student',
    actorUserId: input.studentUserId,
    metadata: {
      courseId: input.courseId,
      courseTitle: input.courseTitle,
    },
  });

  notifyRoles(['admin'], {
    title: 'He thong co enrollment moi',
    message: `${input.studentName} vua enroll khoa hoc "${input.courseTitle}".`,
    severity: 'info',
    entityType: 'system',
    actorRole: 'student',
    actorUserId: input.studentUserId,
    excludeUserIds: input.ownerRole === 'admin' ? [input.ownerId] : undefined,
    metadata: {
      courseId: input.courseId,
      courseTitle: input.courseTitle,
      ownerId: input.ownerId,
    },
  });
}

export function emitPostCreated(actor: AuthUser, post: { id: string; title: string; status: string }): void {
  notifyUsers([actor.userId], {
    title: 'Bai viet da duoc tao',
    message: `Bai viet "${post.title}" da duoc khoi tao thanh cong.`,
    severity: 'success',
    entityType: 'post',
    actorRole: resolveActorRole(actor),
    actorUserId: actor.userId,
    metadata: {
      postId: post.id,
      postTitle: post.title,
      status: post.status,
      ...baseMetadata(actor),
    },
  });

  notifyRoles(['admin'], {
    title: 'Co post moi duoc tao',
    message: `Post "${post.title}" da duoc tao voi trang thai ${post.status}.`,
    severity: 'info',
    entityType: 'system',
    actorRole: resolveActorRole(actor),
    actorUserId: actor.userId,
    excludeUserIds: actor.role === 'admin' ? [actor.userId] : undefined,
    metadata: {
      postId: post.id,
      postTitle: post.title,
      status: post.status,
      ...baseMetadata(actor),
    },
  });
}

export function emitInternalMessageReceived(input: {
  sender: AuthUser;
  recipientUserId: string;
  recipientRole: NotificationRole;
  recipientName: string;
  subject: string;
}): void {
  notifyUsers([input.sender.userId], {
    title: 'Gui tin nhan thanh cong',
    message: `Tin nhan "${input.subject}" da duoc gui toi ${input.recipientName}.`,
    severity: 'success',
    entityType: 'message',
    actorRole: resolveActorRole(input.sender),
    actorUserId: input.sender.userId,
    metadata: {
      subject: input.subject,
      actionPath:
        input.sender.role === 'admin'
          ? '/admin/messages'
          : input.sender.role === 'teacher'
            ? '/teacher/messages'
            : '/student/messages',
      ...baseMetadata(input.sender),
      recipientName: input.recipientName,
      recipientRole: input.recipientRole,
    },
  });

  notifyUsers([input.recipientUserId], {
    title: 'Ban co tin nhan moi',
    message: `${input.sender.email} vua gui mot tin nhan moi: "${input.subject}".`,
    severity: 'info',
    entityType: 'message',
    actorRole: resolveActorRole(input.sender),
    actorUserId: input.sender.userId,
    metadata: {
      subject: input.subject,
      actionPath:
        input.recipientRole === 'admin'
          ? '/admin/messages'
          : input.recipientRole === 'teacher'
            ? '/teacher/messages'
            : '/student/messages',
      ...baseMetadata(input.sender),
      recipientName: input.recipientName,
    },
  });
}

export function emitSystemMessage(title: string, message: string, roles: NotificationRole[]): void {
  dispatchNotification({
    title,
    message,
    severity: 'info',
    entityType: 'system',
    roles,
  });
}
