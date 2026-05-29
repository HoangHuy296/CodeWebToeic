export interface MockTestQuestion {
  id: string;
  section: 'listening' | 'reading' | 'speaking' | 'writing' | 'mixed';
  prompt: string;
  options: Array<{
    key: string;
    text: string;
    isCorrect?: boolean;
  }>;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
  order: number;
  level: 'easy' | 'medium' | 'hard';
  explanation?: string;
  correctAnswer?: string;
}

export interface MockTest {
  id: string;
  catalogKind?: 'mock-test' | 'exercise';
  title: string;
  description: string;
  type: 'mini-test' | 'full-test' | 'practice-set';
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  questionCount: number;
  status: 'draft' | 'published' | 'archived';
  instructions: string[];
  createdBy: {
    id: string;
    fullName?: string;
    email?: string;
  };
  isFeatured: boolean;
  assignedCourseIds: string[];
  exerciseTopicSlug?: string;
  exercisePackSlug?: string;
  questions?: MockTestQuestion[];
}

export interface MockTestSubmissionReviewItem {
  questionId: string;
  prompt: string;
  selectedOption: string;
  correctAnswer?: string;
  isCorrect: boolean;
  explanation?: string;
  points: number;
}

export interface MockTestSubmissionResult {
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
  submittedAt: string;
  review: MockTestSubmissionReviewItem[];
}

export interface MockTestSubmissionRecord {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  submittedAt: string;
  sourceKind: 'free' | 'assigned';
  student: {
    id: string;
    fullName: string;
    email: string;
  };
  mockTest: {
    id: string;
    title: string;
    type: 'mini-test' | 'full-test' | 'practice-set';
    level: 'beginner' | 'intermediate' | 'advanced';
    status: 'draft' | 'published' | 'archived';
    questionCount: number;
    durationMinutes: number;
  };
  creator: {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
  };
  assignedCourses: Array<{
    id: string;
    title: string;
    slug: string;
    ownerId: string;
    ownerName: string;
  }>;
}

export interface MockTestPayload {
  catalogKind?: 'mock-test' | 'exercise';
  title: string;
  description: string;
  type: 'mini-test' | 'full-test' | 'practice-set';
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  status?: 'draft' | 'published' | 'archived';
  instructions?: string[];
  isFeatured?: boolean;
  assignedCourseIds?: string[];
  exerciseTopicSlug?: string;
  exercisePackSlug?: string;
  questions: Array<{
    section: 'listening' | 'reading' | 'speaking' | 'writing' | 'mixed';
    prompt: string;
    explanation?: string;
    options: Array<{
      key: string;
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer: string;
    audioUrl?: string;
    imageUrl?: string;
    points: number;
    order: number;
    level: 'easy' | 'medium' | 'hard';
  }>;
}
