export type AppRole = 'guest' | 'student' | 'teacher' | 'admin';

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: Exclude<AppRole, 'guest'>;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  isActive: boolean;
  ownedCourseIds: string[];
}

export interface AuthPayload {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
  phone?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface VerificationRequestResult {
  deliveryTarget: string;
  expiresAt: string;
  verificationPreviewCode: string;
}
