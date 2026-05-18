// Enrollment lifecycle: join a course, fetch student roster and persist lesson-level progress.
import { Course, Enrollment, Lesson } from '../models/index.js';
import { AuthUser } from '../types/auth.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';
import { canManageCourse } from '../utils/course-permission.js';
import { mapEnrollment } from '../utils/enrollment-transform.js';
import { CreateEnrollmentInput, UpdateProgressInput } from '../validations/enrollment.validation.js';
import { emitEnrollmentCreated } from './notification-events.service.js';

async function findPublishedCourseOrThrow(courseId: string) {
  const course = await Course.findById(courseId).populate('owner', 'fullName email');

  if (!course || !course.isPublished) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  return course;
}

async function findEnrollmentOrThrow(courseId: string, studentId: string) {
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: studentId,
  })
    .populate('course', 'title slug thumbnail category level lessonCount totalDuration')
    .populate('student', 'fullName email');

  if (!enrollment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Enrollment not found');
  }

  return enrollment;
}

function computeProgressPercent(completedCount: number, totalLessons: number): number {
  if (totalLessons <= 0) {
    return 0;
  }

  return Math.round((completedCount / totalLessons) * 100);
}

export async function enrollCourse(
  input: CreateEnrollmentInput,
  user: AuthUser,
): Promise<ReturnType<typeof mapEnrollment>> {
  const course = await findPublishedCourseOrThrow(input.courseId);
  const existingEnrollment = await Enrollment.findOne({
    student: user.userId,
    course: input.courseId,
  });

  if (existingEnrollment) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'You are already enrolled in this course');
  }

  await Enrollment.create({
    student: user.userId,
    course: course._id,
    status: 'active',
    progressPercent: 0,
    completedLessonIds: [],
    lessonProgress: [],
    enrolledAt: new Date(),
  });

  const hydrated = await findEnrollmentOrThrow(course._id.toString(), user.userId);
  const student = hydrated.student as unknown;
  const courseOwner = course.owner as unknown;
  const ownerRole =
    courseOwner && typeof courseOwner === 'object' && 'role' in (courseOwner as Record<string, unknown>)
      ? String((courseOwner as { role?: unknown }).role ?? '') || undefined
      : undefined;
  emitEnrollmentCreated({
    studentUserId: user.userId,
    studentName:
      student && typeof student === 'object' && 'fullName' in (student as Record<string, unknown>)
        ? String((student as { fullName?: unknown }).fullName ?? user.email)
        : user.email,
    courseId: course._id.toString(),
    courseTitle: course.title,
    ownerId:
      courseOwner && typeof courseOwner === 'object' && '_id' in (courseOwner as Record<string, unknown>)
        ? String((courseOwner as { _id: unknown })._id)
        : String(course.owner),
    ownerRole: ownerRole === 'admin' || ownerRole === 'teacher' || ownerRole === 'student' ? ownerRole : undefined,
  });
  return mapEnrollment(hydrated);
}

export async function getMyEnrollments(user: AuthUser): Promise<Array<ReturnType<typeof mapEnrollment>>> {
  const enrollments = await Enrollment.find({
    student: user.userId,
    status: { $in: ['active', 'completed'] },
  })
    .populate('course', 'title slug thumbnail category level lessonCount totalDuration')
    .populate('student', 'fullName email')
    .sort({ createdAt: -1 });

  return enrollments.map((enrollment) => mapEnrollment(enrollment));
}

export async function getCourseEnrollments(
  courseId: string,
  user: AuthUser,
): Promise<Array<ReturnType<typeof mapEnrollment>>> {
  const course = await Course.findById(courseId).populate('owner', 'fullName email');

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  if (user.role !== 'admin' && !canManageCourse(user, course)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to view these enrollments');
  }

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('course', 'title slug thumbnail category level lessonCount totalDuration')
    .populate('student', 'fullName email')
    .sort({ createdAt: -1 });

  return enrollments.map((enrollment) => mapEnrollment(enrollment));
}

export async function updateLearningProgress(
  courseId: string,
  input: UpdateProgressInput,
  user: AuthUser,
): Promise<ReturnType<typeof mapEnrollment>> {
  const enrollment = await findEnrollmentOrThrow(courseId, user.userId);
  const lesson = await Lesson.findOne({
    _id: input.lessonId,
    course: courseId,
  });

  if (!lesson) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Lesson not found in this course');
  }

  const totalLessons = await Lesson.countDocuments({ course: courseId });
  const progressIndex = enrollment.lessonProgress.findIndex(
    (item) => item.lesson.toString() === input.lessonId,
  );
  const nextAccessedAt = input.lastAccessedAt ? new Date(input.lastAccessedAt) : new Date();

  if (progressIndex >= 0) {
    const current = enrollment.lessonProgress[progressIndex];
    current.watchedSeconds =
      typeof input.watchedSeconds === 'number'
        ? Math.max(current.watchedSeconds, input.watchedSeconds)
        : current.watchedSeconds;
    current.isCompleted = input.isCompleted ?? current.isCompleted;
    current.lastAccessedAt = nextAccessedAt;
    current.completedAt = current.isCompleted ? current.completedAt ?? new Date() : undefined;
  } else {
    enrollment.lessonProgress.push({
      lesson: lesson._id,
      watchedSeconds: input.watchedSeconds ?? 0,
      isCompleted: input.isCompleted ?? false,
      completedAt: input.isCompleted ? new Date() : undefined,
      lastAccessedAt: nextAccessedAt,
    });
  }

  const completedIds = enrollment.lessonProgress
    .filter((item) => item.isCompleted)
    .map((item) => item.lesson);

  enrollment.completedLessonIds = completedIds;
  enrollment.progressPercent = computeProgressPercent(completedIds.length, totalLessons);
  enrollment.lastLessonId = lesson._id;
  enrollment.startedAt = enrollment.startedAt ?? new Date();
  enrollment.status = enrollment.progressPercent === 100 && totalLessons > 0 ? 'completed' : 'active';
  enrollment.completedAt = enrollment.status === 'completed' ? enrollment.completedAt ?? new Date() : undefined;

  await enrollment.save();

  const updated = await findEnrollmentOrThrow(courseId, user.userId);
  return mapEnrollment(updated);
}
