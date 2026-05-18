// Immutable graded attempt history for a student on a specific mock test.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

interface SubmissionAnswer {
  question: Types.ObjectId;
  selectedOption: string;
  isCorrect: boolean;
}

export interface TestSubmissionDocument {
  student: Types.ObjectId;
  mockTest: Types.ObjectId;
  answers: SubmissionAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  submittedAt: Date;
}

export type TestSubmissionHydratedDocument = HydratedDocument<TestSubmissionDocument>;
type TestSubmissionModel = Model<TestSubmissionDocument>;

const submissionAnswerSchema = new Schema<SubmissionAnswer>(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false },
);

const testSubmissionSchema = new Schema<TestSubmissionDocument, TestSubmissionModel>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mockTest: {
      type: Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
      index: true,
    },
    answers: {
      type: [submissionAnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
);

testSubmissionSchema.index({ student: 1, mockTest: 1, submittedAt: -1 });

export const TestSubmission =
  (models.TestSubmission as TestSubmissionModel) ||
  model<TestSubmissionDocument, TestSubmissionModel>('TestSubmission', testSubmissionSchema);
