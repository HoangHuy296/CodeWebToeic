import type { AppRole } from '../types/auth';

export function getDefaultRolePath(role: AppRole): string {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

