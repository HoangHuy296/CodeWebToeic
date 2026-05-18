import type { PublicUser } from './auth';

export interface AdminUser extends PublicUser {
  ownedCourseCount: number;
}

export interface RevenueChartPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface EnrollmentChartPoint {
  month: string;
  enrollments: number;
  completed: number;
}
