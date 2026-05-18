import { CourseHydratedDocument } from '../models/course.model.js';
import { LessonHydratedDocument } from '../models/lesson.model.js';

interface CourseOwnerView {
  id: string;
  fullName?: string;
  email?: string;
}

interface LessonView {
  id: string;
  course: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  video: LessonHydratedDocument['video'];
  order: number;
  isPreview: boolean;
  materials: LessonHydratedDocument['materials'];
}

export interface CourseView {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseHydratedDocument['level'];
  price: number;
  salePrice?: number;
  thumbnail: string;
  introVideo: CourseHydratedDocument['introVideo'];
  materials: CourseHydratedDocument['materials'];
  owner: CourseOwnerView;
  lessonCount: number;
  totalDuration: number;
  tags: string[];
  benefits: string[];
  isPublished: boolean;
  reviewStatus: CourseHydratedDocument['reviewStatus'];
  reviewNote?: string;
  publishedAt?: Date;
  lessons?: LessonView[];
}

export function mapLesson(lesson: LessonHydratedDocument): LessonView {
  return {
    id: lesson._id.toString(),
    course: lesson.course.toString(),
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    content: lesson.content,
    video: lesson.video,
    order: lesson.order,
    isPreview: lesson.isPreview,
    materials: lesson.materials,
  };
}

export function mapCourse(course: CourseHydratedDocument, lessons?: LessonHydratedDocument[]): CourseView {
  const ownerValue = course.owner as unknown;
  const owner =
    ownerValue && typeof ownerValue === 'object' && '_id' in (ownerValue as Record<string, unknown>)
      ? {
          id: String((ownerValue as { _id: unknown })._id),
          fullName: 'fullName' in (ownerValue as Record<string, unknown>) ? String((ownerValue as { fullName?: unknown }).fullName ?? '') : undefined,
          email: 'email' in (ownerValue as Record<string, unknown>) ? String((ownerValue as { email?: unknown }).email ?? '') : undefined,
        }
      : {
          id: course.owner.toString(),
        };

  const reviewStatus = course.reviewStatus ?? 'pending_review';

  return {
    id: course._id.toString(),
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    category: course.category,
    level: course.level,
    price: course.price,
    salePrice: course.salePrice,
    thumbnail: course.thumbnail,
    introVideo: course.introVideo,
    materials: course.materials,
    owner,
    lessonCount: course.lessonCount,
    totalDuration: course.totalDuration,
    tags: course.tags,
    benefits: course.benefits,
    isPublished: course.isPublished,
    reviewStatus,
    reviewNote: course.reviewNote,
    publishedAt: course.publishedAt,
    lessons: lessons?.map(mapLesson),
  };
}
