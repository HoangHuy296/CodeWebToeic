import { UserHydratedDocument } from '../models/user.model.js';
import { AuthUser } from '../types/auth.js';

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: AuthUser['role'];
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  isActive: boolean;
  ownedCourseIds: string[];
}

export function mapUserToAuthPayload(user: UserHydratedDocument): AuthUser {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

export function sanitizeUser(user: UserHydratedDocument): PublicUser {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    bio: user.bio,
    isActive: user.isActive,
    ownedCourseIds: user.ownedCourseIds.map((courseId) => courseId.toString()),
  };
}
