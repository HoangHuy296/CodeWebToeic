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
  questions?: MockTestQuestion[];
}

export interface MockTestSubmissionReviewItem {
  questionId: string;
  prompt: string;
  selectedOption: string;
  correctAnswer: string;
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

export interface MockTestPayload {
  title: string;
  description: string;
  type: 'mini-test' | 'full-test' | 'practice-set';
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  status?: 'draft' | 'published' | 'archived';
  instructions?: string[];
  isFeatured?: boolean;
  assignedCourseIds?: string[];
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
