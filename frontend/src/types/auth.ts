export type AppRole = 'guest' | 'student' | 'teacher' | 'admin';
export type GoogleAuthRole = 'student' | 'teacher';
export type LanguageCode = 'vi' | 'en';

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
  preferredLanguage: LanguageCode;
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

export interface GoogleAuthInput {
  credential: string;
  intendedRole: GoogleAuthRole;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
  phone?: string;
  intendedRole: GoogleAuthRole;
  preferredLanguage?: LanguageCode;
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
