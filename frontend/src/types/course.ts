export interface CourseOwner {
  id: string;
  fullName?: string;
  email?: string;
}

export interface CourseMaterial {
  title: string;
  fileUrl: string;
  fileType?: string;
}

export interface VideoMetadata {
  videoUrl: string;
  videoProvider: 'youtube' | 'vimeo' | 'cloudinary' | 'bunny' | 's3' | 'other';
  duration?: number;
  thumbnail?: string;
}

export interface CourseLesson {
  id: string;
  course: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  video: VideoMetadata;
  order: number;
  isPreview: boolean;
  materials: CourseMaterial[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  salePrice?: number;
  thumbnail: string;
  introVideo: VideoMetadata;
  materials: CourseMaterial[];
  owner: CourseOwner;
  lessonCount: number;
  totalDuration: number;
  tags: string[];
  benefits: string[];
  isPublished: boolean;
  reviewStatus: 'pending_review' | 'changes_requested' | 'rejected' | 'approved';
  reviewNote?: string;
  publishedAt?: string;
  lessons?: CourseLesson[];
}
