import { MockTestHydratedDocument } from '../models/mock-test.model.js';
import { QuestionHydratedDocument } from '../models/question.model.js';
import { TestSubmissionHydratedDocument } from '../models/test-submission.model.js';

interface CreatorView {
  id: string;
  fullName?: string;
  email?: string;
}

export interface PublicQuestionView {
  id: string;
  section: QuestionHydratedDocument['section'];
  prompt: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
  order: number;
  level: QuestionHydratedDocument['level'];
}

export interface AdminQuestionView extends PublicQuestionView {
  explanation?: string;
  correctAnswer: string;
  options: Array<{
    key: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export interface MockTestView {
  id: string;
  title: string;
  description: string;
  type: MockTestHydratedDocument['type'];
  level: MockTestHydratedDocument['level'];
  durationMinutes: number;
  questionCount: number;
  status: MockTestHydratedDocument['status'];
  instructions: string[];
  createdBy: CreatorView;
  isFeatured: boolean;
  assignedCourseIds: string[];
  questions?: PublicQuestionView[] | AdminQuestionView[];
}

export interface SubmissionView {
  id: string;
  studentId: string;
  mockTestId: string;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  submittedAt: Date;
}

function mapCreator(value: unknown): CreatorView {
  if (value && typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
    return {
      id: String((value as { _id: unknown })._id),
      fullName: 'fullName' in (value as Record<string, unknown>) ? String((value as { fullName?: unknown }).fullName ?? '') : undefined,
      email: 'email' in (value as Record<string, unknown>) ? String((value as { email?: unknown }).email ?? '') : undefined,
    };
  }

  return { id: String(value) };
}

export function mapQuestionPublic(question: QuestionHydratedDocument): PublicQuestionView {
  return {
    id: question._id.toString(),
    section: question.section,
    prompt: question.prompt,
    options: question.options.map((option) => ({
      key: option.key,
      text: option.text,
    })),
    audioUrl: question.audioUrl,
    imageUrl: question.imageUrl,
    points: question.points,
    order: question.order,
    level: question.level,
  };
}

export function mapQuestionAdmin(question: QuestionHydratedDocument): AdminQuestionView {
  return {
    ...mapQuestionPublic(question),
    explanation: question.explanation,
    correctAnswer: question.correctAnswer,
    options: question.options.map((option) => ({
      key: option.key,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  };
}

export function mapMockTest(
  mockTest: MockTestHydratedDocument,
  questions?: QuestionHydratedDocument[],
  includeAnswers = false,
): MockTestView {
  return {
    id: mockTest._id.toString(),
    title: mockTest.title,
    description: mockTest.description,
    type: mockTest.type,
    level: mockTest.level,
    durationMinutes: mockTest.durationMinutes,
    questionCount: mockTest.questionCount,
    status: mockTest.status,
    instructions: mockTest.instructions,
    createdBy: mapCreator(mockTest.createdBy),
    isFeatured: mockTest.isFeatured,
    assignedCourseIds: mockTest.assignedCourses.map((courseId) => courseId.toString()),
    questions: questions
      ? includeAnswers
        ? questions.map(mapQuestionAdmin)
        : questions.map(mapQuestionPublic)
      : undefined,
  };
}

export function mapSubmission(submission: TestSubmissionHydratedDocument): SubmissionView {
  return {
    id: submission._id.toString(),
    studentId: submission.student.toString(),
    mockTestId: submission.mockTest.toString(),
    answers: submission.answers.map((answer) => ({
      questionId: answer.question.toString(),
      selectedOption: answer.selectedOption,
      isCorrect: answer.isCorrect,
    })),
    score: submission.score,
    totalQuestions: submission.totalQuestions,
    correctAnswers: submission.correctAnswers,
    durationSeconds: submission.durationSeconds,
    submittedAt: submission.submittedAt,
  };
}
