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

export interface AdminWordScore {
  id: string;
  setName: string;
  setSlug: string;
  studentName: string;
  studentId: string | null;
  mode: 'extra' | 'schedule';
  correctFirstTry: number;
  totalAnswered: number;
  totalInSet: number;
  rounds: number;
  totalAttempts: number;
  durationSeconds: number;
  finishedAt: string | null;
}
