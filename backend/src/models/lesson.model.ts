// Course lesson unit. Reuses course media schemas so video/material fields stay consistent.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { materialItemSchema, videoMetadataSchema } from './course.model.js';

const { Schema, model, models } = mongoose;

export interface LessonDocument {
  course: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  content?: string;
  video: {
    videoUrl: string;
    videoProvider: 'youtube' | 'vimeo' | 'cloudinary' | 'bunny' | 's3' | 'other';
    duration?: number;
    thumbnail?: string;
  };
  order: number;
  isPreview: boolean;
  materials: Array<{
    title: string;
    fileUrl: string;
    fileType?: string;
  }>;
}

export type LessonHydratedDocument = HydratedDocument<LessonDocument>;
type LessonModel = Model<LessonDocument>;

const lessonSchema = new Schema<LessonDocument, LessonModel>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    video: {
      type: videoMetadataSchema,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    materials: {
      type: [materialItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

lessonSchema.index({ course: 1, order: 1 }, { unique: true });
lessonSchema.index({ course: 1, slug: 1 }, { unique: true });

export const Lesson =
  (models.Lesson as LessonModel) || model<LessonDocument, LessonModel>('Lesson', lessonSchema);
