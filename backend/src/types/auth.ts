export type UserRole = 'guest' | 'student' | 'teacher' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

