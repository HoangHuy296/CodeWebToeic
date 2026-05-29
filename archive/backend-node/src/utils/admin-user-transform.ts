import { UserHydratedDocument } from '../models/user.model.js';

export interface AdminUserView {
  id: string;
  fullName: string;
  email: string;
  role: UserHydratedDocument['role'];
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  isActive: boolean;
  ownedCourseIds: string[];
  ownedCourseCount: number;
}

export function mapAdminUser(user: UserHydratedDocument, ownedCourseCount = user.ownedCourseIds.length): AdminUserView {
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
    ownedCourseCount,
  };
}
