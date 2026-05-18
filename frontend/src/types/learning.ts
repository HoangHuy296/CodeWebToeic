import type { Course, CourseLesson } from './course';
import type { Enrollment } from './enrollment';

export interface LearningPayload {
  course: Course;
  lessons: CourseLesson[];
  enrollment: Enrollment;
  currentLessonId?: string;
  nextLessonId?: string;
}
