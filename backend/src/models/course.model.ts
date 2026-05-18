// Core sellable learning package: marketing copy, pricing, intro media and review/publish workflow.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

interface VideoMetadata {
  videoUrl: string;
  videoProvider: 'youtube' | 'vimeo' | 'cloudinary' | 'bunny' | 's3' | 'other';
  duration?: number;
  thumbnail?: string;
}

interface MaterialItem {
  title: string;
  fileUrl: string;
  fileType?: string;
}

export interface CourseDocument {
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
  materials: MaterialItem[];
  owner: Types.ObjectId;
  lessonCount: number;
  totalDuration: number;
  tags: string[];
  benefits: string[];
  isPublished: boolean;
  reviewStatus: 'pending_review' | 'changes_requested' | 'rejected' | 'approved';
  reviewNote?: string;
  publishedAt?: Date;
}

export type CourseHydratedDocument = HydratedDocument<CourseDocument>;
type CourseModel = Model<CourseDocument>;

const videoMetadataSchema = new Schema<VideoMetadata>(
  {
    videoUrl: { type: String, required: true, trim: true },
    videoProvider: {
      type: String,
      enum: ['youtube', 'vimeo', 'cloudinary', 'bunny', 's3', 'other'],
      default: 'youtube',
    },
    duration: { type: Number, min: 0 },
    thumbnail: { type: String, trim: true },
  },
  { _id: false },
);

const materialItemSchema = new Schema<MaterialItem>(
  {
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true },
  },
  { _id: false },
);

const courseSchema = new Schema<CourseDocument, CourseModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    introVideo: {
      type: videoMetadataSchema,
      required: true,
    },
    materials: {
      type: [materialItemSchema],
      default: [],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lessonCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: ['pending_review', 'changes_requested', 'rejected', 'approved'],
      default: 'pending_review',
      index: true,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ category: 1, level: 1, isPublished: 1 });

export const Course =
  (models.Course as CourseModel) || model<CourseDocument, CourseModel>('Course', courseSchema);

export { materialItemSchema, videoMetadataSchema };
