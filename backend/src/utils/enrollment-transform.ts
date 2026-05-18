import { EnrollmentHydratedDocument } from '../models/enrollment.model.js';

interface StudentView {
  id: string;
  fullName?: string;
  email?: string;
}

interface CourseView {
  id: string;
  title?: string;
  slug?: string;
  thumbnail?: string;
  category?: string;
  level?: string;
  lessonCount?: number;
  totalDuration?: number;
}

interface LessonProgressView {
  lessonId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  completedAt?: Date;
  lastAccessedAt?: Date;
}

export interface EnrollmentView {
  id: string;
  student: StudentView;
  course: CourseView;
  status: EnrollmentHydratedDocument['status'];
  progressPercent: number;
  completedLessonIds: string[];
  lessonProgress: LessonProgressView[];
  lastLessonId?: string;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

function mapStudent(value: unknown): StudentView {
  if (value && typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
    return {
      id: String((value as { _id: unknown })._id),
      fullName: 'fullName' in (value as Record<string, unknown>) ? String((value as { fullName?: unknown }).fullName ?? '') : undefined,
      email: 'email' in (value as Record<string, unknown>) ? String((value as { email?: unknown }).email ?? '') : undefined,
    };
  }

  return { id: String(value) };
}

function mapCourse(value: unknown): CourseView {
  if (value && typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
    const obj = value as Record<string, unknown>;
    return {
      id: String(obj._id),
      title: typeof obj.title === 'string' ? obj.title : undefined,
      slug: typeof obj.slug === 'string' ? obj.slug : undefined,
      thumbnail: typeof obj.thumbnail === 'string' ? obj.thumbnail : undefined,
      category: typeof obj.category === 'string' ? obj.category : undefined,
      level: typeof obj.level === 'string' ? obj.level : undefined,
      lessonCount: typeof obj.lessonCount === 'number' ? obj.lessonCount : undefined,
      totalDuration: typeof obj.totalDuration === 'number' ? obj.totalDuration : undefined,
    };
  }

  return { id: String(value) };
}

export function mapEnrollment(enrollment: EnrollmentHydratedDocument): EnrollmentView {
  return {
    id: enrollment._id.toString(),
    student: mapStudent(enrollment.student),
    course: mapCourse(enrollment.course),
    status: enrollment.status,
    progressPercent: enrollment.progressPercent,
    completedLessonIds: enrollment.completedLessonIds.map((lessonId) => lessonId.toString()),
    lessonProgress: enrollment.lessonProgress.map((item) => ({
      lessonId: item.lesson.toString(),
      watchedSeconds: item.watchedSeconds,
      isCompleted: item.isCompleted,
      completedAt: item.completedAt,
      lastAccessedAt: item.lastAccessedAt,
    })),
    lastLessonId: enrollment.lastLessonId?.toString(),
    enrolledAt: enrollment.enrolledAt,
    startedAt: enrollment.startedAt,
    completedAt: enrollment.completedAt,
  };
}

