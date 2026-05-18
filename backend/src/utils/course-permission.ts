import { CourseHydratedDocument } from '../models/course.model.js';
import { AuthUser } from '../types/auth.js';

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

export function isTeacher(user: AuthUser): boolean {
  return user.role === 'teacher';
}

function resolveOwnerId(course: CourseHydratedDocument): string {
  const owner = course.owner as unknown;

  if (owner && typeof owner === 'object' && '_id' in (owner as Record<string, unknown>)) {
    return String((owner as { _id: unknown })._id);
  }

  return course.owner.toString();
}

export function canManageCourse(user: AuthUser, course: CourseHydratedDocument): boolean {
  if (isAdmin(user)) {
    return true;
  }

  return isTeacher(user) && resolveOwnerId(course) === user.userId;
}
