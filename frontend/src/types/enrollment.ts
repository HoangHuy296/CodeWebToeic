export interface Enrollment {
  id: string;
  student: {
    id: string;
    fullName?: string;
    email?: string;
  };
  course: {
    id: string;
    title?: string;
    slug?: string;
    thumbnail?: string;
    category?: string;
    level?: string;
    lessonCount?: number;
    totalDuration?: number;
  };
  status: 'active' | 'completed' | 'cancelled';
  progressPercent: number;
  completedLessonIds: string[];
  lessonProgress: Array<{
    lessonId: string;
    watchedSeconds: number;
    isCompleted: boolean;
    completedAt?: string;
    lastAccessedAt?: string;
  }>;
  lastLessonId?: string;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
}

