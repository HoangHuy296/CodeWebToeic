// Individual graded item belonging to one mock test, including answer key and explanation.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

interface QuestionOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionDocument {
  mockTest: Types.ObjectId;
  section: 'listening' | 'reading' | 'speaking' | 'writing' | 'mixed';
  prompt: string;
  explanation?: string;
  options: QuestionOption[];
  correctAnswer: string;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
  order: number;
  level: 'easy' | 'medium' | 'hard';
}

export type QuestionHydratedDocument = HydratedDocument<QuestionDocument>;
type QuestionModel = Model<QuestionDocument>;

const questionOptionSchema = new Schema<QuestionOption>(
  {
    key: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false },
);

const questionSchema = new Schema<QuestionDocument, QuestionModel>(
  {
    mockTest: {
      type: Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
      index: true,
    },
    section: {
      type: String,
      enum: ['listening', 'reading', 'speaking', 'writing', 'mixed'],
      default: 'mixed',
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    options: {
      type: [questionOptionSchema],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    audioUrl: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    level: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  },
);

questionSchema.index({ mockTest: 1, order: 1 }, { unique: true });

export const Question =
  (models.Question as QuestionModel) || model<QuestionDocument, QuestionModel>('Question', questionSchema);
