// Builds the one-shot payload used by the full-screen learning page after verifying enrollment access.
import { Course, Enrollment, Lesson } from '../models/index.js';
import { AuthUser } from '../types/auth.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';
import { mapCourse, mapLesson } from '../utils/course-transform.js';
import { mapEnrollment } from '../utils/enrollment-transform.js';

export async function getLearningData(courseId: string, user: AuthUser) {
  const course = await Course.findById(courseId).populate('owner', 'fullName email');

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: user.userId,
  })
    .populate('course', 'title slug thumbnail category level lessonCount totalDuration')
    .populate('student', 'fullName email');

  if (!enrollment) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You must enroll in this course before accessing learning data');
  }

  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
  const currentLesson =
    lessons.find((lesson) => lesson._id.toString() === enrollment.lastLessonId?.toString()) ?? lessons[0] ?? null;
  const nextLesson =
    currentLesson
      ? lessons.find((lesson) => lesson.order === currentLesson.order + 1) ?? null
      : null;

  return {
    course: mapCourse(course, lessons),
    lessons: lessons.map((lesson) => mapLesson(lesson)),
    enrollment: mapEnrollment(enrollment),
    currentLessonId: currentLesson?._id.toString(),
    nextLessonId: nextLesson?._id.toString(),
  };
}
