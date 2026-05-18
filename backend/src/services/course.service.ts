// Course + lesson CRUD plus the teacher/admin review workflow for draft, changes_requested and publish states.
import { HTTP_STATUS } from '../constants/http-status.js';
import { Course, CourseHydratedDocument } from '../models/course.model.js';
import { Lesson, LessonHydratedDocument } from '../models/lesson.model.js';
import { User } from '../models/user.model.js';
import { AuthUser } from '../types/auth.js';
import { ApiError } from '../utils/api-error.js';
import { canManageCourse, isAdmin } from '../utils/course-permission.js';
import { mapCourse, mapLesson } from '../utils/course-transform.js';
import { toSlug } from '../utils/slug.js';
import { emitCourseStatusChanged } from './notification-events.service.js';
import {
  CreateCourseInput,
  CreateLessonInput,
  UpdateCourseInput,
  UpdateLessonInput,
} from '../validations/course.validation.js';

async function ensureUniqueCourseSlug(slug: string, excludeCourseId?: string): Promise<void> {
  const existing = await Course.findOne({
    slug,
    ...(excludeCourseId ? { _id: { $ne: excludeCourseId } } : {}),
  });

  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Course slug already exists');
  }
}

async function ensureUniqueLessonSlug(courseId: string, slug: string, excludeLessonId?: string): Promise<void> {
  const existing = await Lesson.findOne({
    course: courseId,
    slug,
    ...(excludeLessonId ? { _id: { $ne: excludeLessonId } } : {}),
  });

  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Lesson slug already exists in this course');
  }
}

async function syncCourseLessonStats(courseId: string): Promise<void> {
  const lessons = await Lesson.find({ course: courseId }).select('video.duration');
  const lessonCount = lessons.length;
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.video.duration ?? 0), 0);

  await Course.findByIdAndUpdate(courseId, { lessonCount, totalDuration });
}

async function findCourseByIdOrThrow(courseId: string): Promise<CourseHydratedDocument> {
  const course = await Course.findById(courseId).populate('owner', 'fullName email');

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  return course;
}

function resolveOwnerId(course: CourseHydratedDocument): string {
  const owner = course.owner as unknown;

  if (owner && typeof owner === 'object' && '_id' in (owner as Record<string, unknown>)) {
    return String((owner as { _id: unknown })._id);
  }

  return course.owner.toString();
}

async function ensureCourseManagePermission(courseId: string, user: AuthUser): Promise<CourseHydratedDocument> {
  const course = await findCourseByIdOrThrow(courseId);

  if (!canManageCourse(user, course)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to manage this course');
  }

  return course;
}

async function findLessonByIdOrThrow(lessonId: string): Promise<LessonHydratedDocument> {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Lesson not found');
  }

  return lesson;
}

export async function listCourses(): Promise<ReturnType<typeof mapCourse>[]> {
  const courses = await Course.find({ isPublished: true })
    .populate('owner', 'fullName email')
    .sort({ publishedAt: -1, createdAt: -1 });

  return courses.map((course) => mapCourse(course));
}

export async function listManageCourses(user: AuthUser): Promise<ReturnType<typeof mapCourse>[]> {
  const filter = user.role === 'admin' ? {} : { owner: user.userId };
  const courses = await Course.find(filter)
    .populate('owner', 'fullName email')
    .sort({ updatedAt: -1, createdAt: -1 });

  return courses.map((course) => mapCourse(course));
}

export async function getCourseBySlug(slug: string, user?: AuthUser): Promise<ReturnType<typeof mapCourse>> {
  const course = await Course.findOne({ slug }).populate('owner', 'fullName email');

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  if (!course.isPublished) {
    if (!user || (!isAdmin(user) && resolveOwnerId(course) !== user.userId)) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
    }
  }

  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
  return mapCourse(course, lessons);
}

export async function createCourse(input: CreateCourseInput, user: AuthUser): Promise<ReturnType<typeof mapCourse>> {
  const slug = toSlug(input.slug ?? input.title);
  await ensureUniqueCourseSlug(slug);
  const isTeacher = user.role === 'teacher';

  const course = await Course.create({
    ...input,
    slug,
    owner: user.userId,
    isPublished: isTeacher ? false : (input.isPublished ?? false),
    reviewStatus: isTeacher ? 'pending_review' : input.isPublished ? 'approved' : 'pending_review',
    reviewNote: input.reviewNote,
    publishedAt: !isTeacher && input.isPublished ? new Date() : undefined,
  });

  await User.findByIdAndUpdate(user.userId, { $addToSet: { ownedCourseIds: course._id } });

  const createdCourse = await findCourseByIdOrThrow(course._id.toString());
  emitCourseStatusChanged(
    user,
    {
      id: createdCourse._id.toString(),
      slug: createdCourse.slug,
      title: createdCourse.title,
      isPublished: createdCourse.isPublished,
      ownerId: resolveOwnerId(createdCourse),
    },
    'created',
  );
  return mapCourse(createdCourse);
}

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
  user: AuthUser,
): Promise<ReturnType<typeof mapCourse>> {
  const course = await ensureCourseManagePermission(courseId, user);
  const previousPublishedState = course.isPublished;
  const nextSlug = input.slug ? toSlug(input.slug) : input.title ? toSlug(input.title) : undefined;

  if (user.role === 'teacher' && typeof input.isPublished === 'boolean' && input.isPublished !== course.isPublished) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Teachers cannot publish courses directly. Submit the draft for admin review.');
  }
  if (user.role === 'teacher' && (typeof input.reviewStatus === 'string' || typeof input.reviewNote === 'string')) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Teachers cannot change admin review status.');
  }

  if (nextSlug && nextSlug !== course.slug) {
    await ensureUniqueCourseSlug(nextSlug, courseId);
  }

  const nextIsPublished = input.isPublished ?? course.isPublished;
  const teacherIsSubmittingForReview = user.role === 'teacher';
  // Any teacher save is treated as a resubmission. Teachers never push directly to published.
  const nextReviewStatus =
    user.role === 'admin'
      ? input.reviewStatus ?? (nextIsPublished ? 'approved' : course.reviewStatus)
      : teacherIsSubmittingForReview
        ? 'pending_review'
        : course.reviewStatus;

  Object.assign(course, {
    ...input,
    ...(nextSlug ? { slug: nextSlug } : {}),
    reviewStatus: nextReviewStatus,
    reviewNote: teacherIsSubmittingForReview
      ? undefined
      : typeof input.reviewNote === 'string'
        ? input.reviewNote
        : course.reviewNote,
    isPublished: teacherIsSubmittingForReview ? false : nextIsPublished,
    publishedAt: teacherIsSubmittingForReview
      ? undefined
      : nextIsPublished && !course.publishedAt
        ? new Date()
        : nextIsPublished
          ? course.publishedAt
          : undefined,
  });

  if (user.role === 'admin') {
    // Admin review status is the source of truth for publish/draft transitions after moderation.
    if (nextReviewStatus === 'approved') {
      course.isPublished = true;
    }

    if (nextReviewStatus === 'changes_requested' || nextReviewStatus === 'rejected') {
      course.isPublished = false;
      course.publishedAt = undefined;
    }
  }

  await course.save();
  const updatedCourse = await findCourseByIdOrThrow(courseId);
  emitCourseStatusChanged(
    user,
    {
      id: updatedCourse._id.toString(),
      slug: updatedCourse.slug,
      title: updatedCourse.title,
      isPublished: updatedCourse.isPublished,
      ownerId: resolveOwnerId(updatedCourse),
    },
    user.role === 'admin' && updatedCourse.reviewStatus === 'changes_requested'
      ? 'changes_requested'
      : user.role === 'admin' && updatedCourse.reviewStatus === 'rejected'
        ? 'rejected'
        : user.role === 'teacher' && updatedCourse.reviewStatus === 'pending_review' && !updatedCourse.isPublished
          ? 'updated'
        : previousPublishedState !== updatedCourse.isPublished
          ? updatedCourse.isPublished
            ? 'published'
            : 'draft'
          : 'updated',
  );
  return mapCourse(updatedCourse);
}

export async function deleteCourse(courseId: string): Promise<void> {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  await Lesson.deleteMany({ course: course._id });
  await course.deleteOne();
}

export async function createLesson(
  courseId: string,
  input: CreateLessonInput,
  user: AuthUser,
): Promise<ReturnType<typeof mapLesson>> {
  await ensureCourseManagePermission(courseId, user);
  const slug = toSlug(input.slug ?? input.title);
  await ensureUniqueLessonSlug(courseId, slug);

  const existingOrder = await Lesson.findOne({ course: courseId, order: input.order });

  if (existingOrder) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Lesson order already exists in this course');
  }

  const lesson = await Lesson.create({
    ...input,
    slug,
    course: courseId,
  });

  await syncCourseLessonStats(courseId);
  return mapLesson(lesson);
}

export async function updateLesson(
  lessonId: string,
  input: UpdateLessonInput,
  user: AuthUser,
): Promise<ReturnType<typeof mapLesson>> {
  const lesson = await findLessonByIdOrThrow(lessonId);
  await ensureCourseManagePermission(lesson.course.toString(), user);

  const nextSlug = input.slug ? toSlug(input.slug) : input.title ? toSlug(input.title) : undefined;
  if (nextSlug && nextSlug !== lesson.slug) {
    await ensureUniqueLessonSlug(lesson.course.toString(), nextSlug, lessonId);
  }

  if (typeof input.order === 'number' && input.order !== lesson.order) {
    const existingOrder = await Lesson.findOne({
      course: lesson.course,
      order: input.order,
      _id: { $ne: lessonId },
    });

    if (existingOrder) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Lesson order already exists in this course');
    }
  }

  Object.assign(lesson, {
    ...input,
    ...(nextSlug ? { slug: nextSlug } : {}),
  });

  await lesson.save();
  await syncCourseLessonStats(lesson.course.toString());
  return mapLesson(lesson);
}

export async function deleteLesson(lessonId: string, user: AuthUser): Promise<void> {
  const lesson = await findLessonByIdOrThrow(lessonId);
  await ensureCourseManagePermission(lesson.course.toString(), user);

  const courseId = lesson.course.toString();
  await lesson.deleteOne();
  await syncCourseLessonStats(courseId);
}
