import { unwrapResponse, api } from './api';
import type { AdminUser, EnrollmentChartPoint, RevenueChartPoint } from '../types/admin';

export interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
  };
  content: {
    publishedCourses: number;
    publishedMockTests: number;
    publishedPosts: number;
  };
  enrollments: {
    total: number;
    completed: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    currency: string;
    paidOrders: number;
  };
}

export const adminApi = {
  stats() {
    return unwrapResponse<AdminStats>(api.get('/admin/stats'));
  },
  revenueChart() {
    return unwrapResponse<RevenueChartPoint[]>(api.get('/admin/charts/revenue'));
  },
  enrollmentChart() {
    return unwrapResponse<EnrollmentChartPoint[]>(api.get('/admin/charts/enrollments'));
  },
  users() {
    return unwrapResponse<AdminUser[]>(api.get('/admin/users'));
  },
  user(id: string) {
    return unwrapResponse<AdminUser>(api.get(`/admin/users/${id}`));
  },
  updateUser(
    id: string,
    payload: Partial<Pick<AdminUser, 'fullName' | 'email' | 'role' | 'avatarUrl' | 'phone' | 'bio' | 'isActive'>>,
  ) {
    return unwrapResponse<AdminUser>(api.patch(`/admin/users/${id}`, payload));
  },
  deactivateUser(id: string) {
    return unwrapResponse<AdminUser>(api.delete(`/admin/users/${id}`));
  },
};
