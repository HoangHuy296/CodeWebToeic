// Mock test container. Questions and submissions live in separate collections for flexibility and grading.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

export interface MockTestDocument {
  title: string;
  description: string;
  type: 'mini-test' | 'full-test' | 'practice-set';
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  questionCount: number;
  status: 'draft' | 'published' | 'archived';
  instructions: string[];
  createdBy: Types.ObjectId;
  isFeatured: boolean;
  assignedCourses: Types.ObjectId[];
}

export type MockTestHydratedDocument = HydratedDocument<MockTestDocument>;
type MockTestModel = Model<MockTestDocument>;

const mockTestSchema = new Schema<MockTestDocument, MockTestModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['mini-test', 'full-test', 'practice-set'],
      default: 'mini-test',
      index: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    questionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    instructions: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    assignedCourses: {
      type: [Schema.Types.ObjectId],
      ref: 'Course',
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

mockTestSchema.index({ status: 1, level: 1, type: 1 });

export const MockTest =
  (models.MockTest as MockTestModel) || model<MockTestDocument, MockTestModel>('MockTest', mockTestSchema);
