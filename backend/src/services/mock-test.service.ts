// Mock-test visibility, author permissions and server-side grading all live in this service.
import { HTTP_STATUS } from '../constants/http-status.js';
import { Course, Enrollment, MockTest, Question, TestSubmission } from '../models/index.js';
import { MockTestHydratedDocument } from '../models/mock-test.model.js';
import { AuthUser } from '../types/auth.js';
import { ApiError } from '../utils/api-error.js';
import { mapMockTest, mapSubmission } from '../utils/mock-test-transform.js';
import {
  CreateMockTestInput,
  SubmitMockTestInput,
  UpdateMockTestInput,
} from '../validations/mock-test.validation.js';

function resolveCreatorId(mockTest: MockTestHydratedDocument): string {
  const createdBy = mockTest.createdBy as unknown;

  if (createdBy && typeof createdBy === 'object' && '_id' in (createdBy as Record<string, unknown>)) {
    return String((createdBy as { _id: unknown })._id);
  }

  return mockTest.createdBy.toString();
}

function canManageMockTest(user: AuthUser, mockTest: MockTestHydratedDocument): boolean {
  return user.role === 'admin' || (user.role === 'teacher' && resolveCreatorId(mockTest) === user.userId);
}

async function ensureManagePermission(mockTestId: string, user: AuthUser) {
  const mockTest = await findMockTestOrThrow(mockTestId);

  if (!canManageMockTest(user, mockTest)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to manage this mock test');
  }

  return mockTest;
}

async function ensureAssignedCoursesPermission(assignedCourseIds: string[], user: AuthUser): Promise<void> {
  if (assignedCourseIds.length === 0) {
    return;
  }

  const query =
    user.role === 'admin'
      ? { _id: { $in: assignedCourseIds } }
      : { _id: { $in: assignedCourseIds }, owner: user.userId };
  const count = await Course.countDocuments(query);

  if (count !== assignedCourseIds.length) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Assigned courses must belong to the current workspace');
  }
}

async function getStudentAccessibleCourseIds(userId: string): Promise<string[]> {
  const enrollments = await Enrollment.find({
    student: userId,
    status: { $in: ['active', 'completed'] },
  }).select('course');

  return enrollments.map((enrollment) => enrollment.course.toString());
}

async function syncQuestionCount(mockTestId: string): Promise<void> {
  const questionCount = await Question.countDocuments({ mockTest: mockTestId });
  await MockTest.findByIdAndUpdate(mockTestId, { questionCount });
}

async function replaceQuestions(mockTestId: string, questions: CreateMockTestInput['questions']): Promise<void> {
  const uniqueOrders = new Set<number>();

  for (const question of questions) {
    if (uniqueOrders.has(question.order)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Duplicate question order: ${question.order}`);
    }

    uniqueOrders.add(question.order);
  }

  await Question.deleteMany({ mockTest: mockTestId });
  await Question.insertMany(
    questions.map((question) => ({
      ...question,
      mockTest: mockTestId,
      correctAnswer: question.correctAnswer,
    })),
  );
  await syncQuestionCount(mockTestId);
}

async function findMockTestOrThrow(mockTestId: string) {
  const mockTest = await MockTest.findById(mockTestId).populate('createdBy', 'fullName email');

  if (!mockTest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mock test not found');
  }

  return mockTest;
}

export async function listMockTests(user?: AuthUser) {
  let query = MockTest.find({ status: 'published' as const });

  if (!user) {
    query = MockTest.find({
      status: 'published' as const,
      assignedCourses: { $size: 0 },
    });
  } else if (user.role === 'student') {
    // Students only see free published tests or tests assigned to courses they enrolled in.
    const accessibleCourseIds = await getStudentAccessibleCourseIds(user.userId);
    query = MockTest.find({
      status: 'published' as const,
      $or: [{ assignedCourses: { $size: 0 } }, { assignedCourses: { $in: accessibleCourseIds } }],
    });
  } else if (user.role === 'teacher') {
    // Teachers see admin free tests plus everything they created for their own learners.
    query = MockTest.find({
      $or: [
        { status: 'published' as const, assignedCourses: { $size: 0 } },
        { createdBy: user.userId },
      ],
    });
  }

  const mockTests = (await query
    .populate('createdBy', 'fullName email')
    .sort({ isFeatured: -1, createdAt: -1 })) as MockTestHydratedDocument[];

  return mockTests.map((mockTest) => mapMockTest(mockTest));
}

export async function listManagedMockTests(user: AuthUser) {
  const filter = user.role === 'admin' ? {} : { createdBy: user.userId };
  const mockTests = (await MockTest.find(filter)
    .populate('createdBy', 'fullName email')
    .sort({ updatedAt: -1, createdAt: -1 })) as MockTestHydratedDocument[];

  return mockTests.map((mockTest) => mapMockTest(mockTest));
}

export async function getMockTestById(mockTestId: string, user?: AuthUser) {
  const mockTest = await findMockTestOrThrow(mockTestId);

  const isManager = Boolean(user && canManageMockTest(user, mockTest));

  if (mockTest.status !== 'published' && !isManager) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mock test not found');
  }

  if (mockTest.status === 'published' && mockTest.assignedCourses.length > 0 && !isManager) {
    if (!user || user.role !== 'student') {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mock test not found');
    }

    const accessibleCourseIds = await getStudentAccessibleCourseIds(user.userId);
    const canAccess = mockTest.assignedCourses.some((courseId) => accessibleCourseIds.includes(courseId.toString()));

    if (!canAccess) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have access to this mock test');
    }
  }

  const questions = await Question.find({ mockTest: mockTestId }).sort({ order: 1 });
  return mapMockTest(mockTest, questions, Boolean(isManager));
}

export async function createMockTest(input: CreateMockTestInput, user: AuthUser) {
  await ensureAssignedCoursesPermission(input.assignedCourseIds ?? [], user);
  const mockTest = await MockTest.create({
    title: input.title,
    description: input.description,
    type: input.type,
    level: input.level,
    durationMinutes: input.durationMinutes,
    status: input.status ?? 'draft',
    instructions: input.instructions ?? [],
    isFeatured: input.isFeatured ?? false,
    createdBy: user.userId,
    questionCount: input.questions.length,
    assignedCourses: input.assignedCourseIds ?? [],
  });

  await replaceQuestions(mockTest._id.toString(), input.questions);
  const created = await findMockTestOrThrow(mockTest._id.toString());
  const questions = await Question.find({ mockTest: mockTest._id }).sort({ order: 1 });
  return mapMockTest(created, questions, true);
}

export async function updateMockTest(mockTestId: string, input: UpdateMockTestInput, user: AuthUser) {
  const mockTest = await ensureManagePermission(mockTestId, user);

  if (input.assignedCourseIds) {
    await ensureAssignedCoursesPermission(input.assignedCourseIds, user);
  }

  Object.assign(mockTest, {
    ...(typeof input.title === 'string' ? { title: input.title } : {}),
    ...(typeof input.description === 'string' ? { description: input.description } : {}),
    ...(typeof input.type === 'string' ? { type: input.type } : {}),
    ...(typeof input.level === 'string' ? { level: input.level } : {}),
    ...(typeof input.durationMinutes === 'number' ? { durationMinutes: input.durationMinutes } : {}),
    ...(typeof input.status === 'string' ? { status: input.status } : {}),
    ...(typeof input.isFeatured === 'boolean' ? { isFeatured: input.isFeatured } : {}),
    ...(input.instructions ? { instructions: input.instructions } : {}),
    ...(input.assignedCourseIds ? { assignedCourses: input.assignedCourseIds } : {}),
  });

  await mockTest.save();

  if (input.questions) {
    await replaceQuestions(mockTestId, input.questions);
  }

  const updated = await findMockTestOrThrow(mockTestId);
  const questions = await Question.find({ mockTest: mockTestId }).sort({ order: 1 });
  return mapMockTest(updated, questions, true);
}

export async function deleteMockTest(mockTestId: string, user: AuthUser): Promise<void> {
  const mockTest = await ensureManagePermission(mockTestId, user);

  await Question.deleteMany({ mockTest: mockTestId });
  await TestSubmission.deleteMany({ mockTest: mockTestId });
  await mockTest.deleteOne();
}

export async function submitMockTest(mockTestId: string, input: SubmitMockTestInput, user: AuthUser) {
  const mockTest = await MockTest.findById(mockTestId);

  if (!mockTest || mockTest.status !== 'published') {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mock test not found');
  }

  if (mockTest.assignedCourses.length > 0) {
    const accessibleCourseIds = await getStudentAccessibleCourseIds(user.userId);
    const canAccess = mockTest.assignedCourses.some((courseId) => accessibleCourseIds.includes(courseId.toString()));

    if (!canAccess) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have access to this mock test');
    }
  }

  const questions = await Question.find({ mockTest: mockTestId }).sort({ order: 1 });

  if (questions.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mock test has no questions');
  }

  // Grading is performed entirely on the server so correct answers never come from the client.
  const answerMap = new Map(input.answers.map((answer) => [answer.questionId, answer.selectedOption]));
  const gradedAnswers = questions.map((question) => {
    const selectedOption = answerMap.get(question._id.toString()) ?? '';
    const isCorrect = selectedOption === question.correctAnswer;

    return {
      question: question._id,
      selectedOption,
      isCorrect,
    };
  });

  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  const earnedPoints = questions.reduce((sum, question, index) => {
    return sum + (gradedAnswers[index].isCorrect ? question.points : 0);
  }, 0);
  const correctAnswers = gradedAnswers.filter((answer) => answer.isCorrect).length;
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const submission = await TestSubmission.create({
    student: user.userId,
    mockTest: mockTestId,
    answers: gradedAnswers,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    durationSeconds: input.durationSeconds,
    submittedAt: new Date(),
  });

  return {
    ...mapSubmission(submission),
    review: questions.map((question) => {
      const answer = gradedAnswers.find((item) => item.question.toString() === question._id.toString());

      return {
        questionId: question._id.toString(),
        prompt: question.prompt,
        selectedOption: answer?.selectedOption ?? '',
        correctAnswer: question.correctAnswer,
        isCorrect: answer?.isCorrect ?? false,
        explanation: question.explanation,
        points: question.points,
      };
    }),
  };
}
