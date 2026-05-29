// Student-course relationship plus per-lesson progress snapshot for learning and dashboard pages.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

interface LessonProgressItem {
  lesson: Types.ObjectId;
  watchedSeconds: number;
  isCompleted: boolean;
  completedAt?: Date;
  lastAccessedAt?: Date;
}

export interface EnrollmentDocument {
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: 'active' | 'completed' | 'cancelled';
  progressPercent: number;
  completedLessonIds: Types.ObjectId[];
  lessonProgress: LessonProgressItem[];
  lastLessonId?: Types.ObjectId;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type EnrollmentHydratedDocument = HydratedDocument<EnrollmentDocument>;
type EnrollmentModel = Model<EnrollmentDocument>;

const lessonProgressSchema = new Schema<LessonProgressItem>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  { _id: false },
);

const enrollmentSchema = new Schema<EnrollmentDocument, EnrollmentModel>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessonIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Lesson',
      default: [],
    },
    lessonProgress: {
      type: [lessonProgressSchema],
      default: [],
    },
    lastLessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    enrolledAt: {
      type: Date,
      default: () => new Date(),
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment =
  (models.Enrollment as EnrollmentModel) ||
  model<EnrollmentDocument, EnrollmentModel>('Enrollment', enrollmentSchema);
