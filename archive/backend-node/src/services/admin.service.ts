// Admin-only analytics and user management aggregation live here to keep controllers thin.
import { BlogPost, Course, Enrollment, MockTest, Order, User } from '../models/index.js';
import { UserHydratedDocument } from '../models/user.model.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';
import { mapAdminUser } from '../utils/admin-user-transform.js';
import { UpdateAdminUserInput } from '../validations/admin.validation.js';

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function subtractUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, 1));
}

function buildMonthRange(months = 6): Array<{ key: string; label: string; date: Date }> {
  return Array.from({ length: months }, (_, index) => {
    const date = startOfUtcMonth(subtractUtcMonths(new Date(), months - index - 1));
    return {
      key: monthKey(date),
      label: date.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      date,
    };
  });
}

async function findUserByIdOrThrow(userId: string): Promise<UserHydratedDocument> {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return user;
}

async function getOwnedCourseCountForUser(user: UserHydratedDocument): Promise<number> {
  if (user.role === 'student') {
    return Enrollment.countDocuments({
      student: user._id,
      status: { $in: ['active', 'completed'] },
    });
  }

  return Course.countDocuments({ owner: user._id });
}

async function buildOwnedCourseCountMap(users: UserHydratedDocument[]): Promise<Map<string, number>> {
  const teacherAndAdminIds = users
    .filter((user) => user.role !== 'student')
    .map((user) => user._id);
  const studentIds = users.filter((user) => user.role === 'student').map((user) => user._id);

  const [courseCounts, enrollmentCounts] = await Promise.all([
    teacherAndAdminIds.length > 0
      ? Course.aggregate<{ _id: string; count: number }>([
          { $match: { owner: { $in: teacherAndAdminIds } } },
          { $group: { _id: '$owner', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    studentIds.length > 0
      ? Enrollment.aggregate<{ _id: string; count: number }>([
          {
            $match: {
              student: { $in: studentIds },
              status: { $in: ['active', 'completed'] },
            },
          },
          { $group: { _id: '$student', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
  ]);

  const countMap = new Map<string, number>();

  for (const item of courseCounts) {
    countMap.set(String(item._id), item.count);
  }

  for (const item of enrollmentCounts) {
    countMap.set(String(item._id), item.count);
  }

  return countMap;
}

export async function getAdminStats() {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    publishedCourses,
    publishedMockTests,
    publishedPosts,
    totalEnrollments,
    completedEnrollments,
    paidOrders,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'admin' }),
    Course.countDocuments({ isPublished: true }),
    MockTest.countDocuments({ status: 'published' }),
    BlogPost.countDocuments({ status: 'published' }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'completed' }),
    Order.find({ status: 'paid' }).select('amount currency'),
  ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const completionRate =
    totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
      admins: totalAdmins,
    },
    content: {
      publishedCourses,
      publishedMockTests,
      publishedPosts,
    },
    enrollments: {
      total: totalEnrollments,
      completed: completedEnrollments,
      completionRate,
    },
    revenue: {
      total: totalRevenue,
      currency: 'VND',
      paidOrders: paidOrders.length,
    },
  };
}

export async function getRevenueChart() {
  const months = buildMonthRange(6);
  const fromDate = months[0].date;
  const paidOrders = await Order.find({
    status: 'paid',
    $or: [{ paidAt: { $gte: fromDate } }, { createdAt: { $gte: fromDate } }],
  }).select('amount paidAt createdAt');

  const buckets = new Map(
    months.map((month) => [
      month.key,
      { month: month.label, revenue: 0, orders: 0 },
    ]),
  );

  for (const order of paidOrders) {
    const key = monthKey(order.paidAt ?? (order as unknown as { createdAt: Date }).createdAt);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.revenue += order.amount;
      bucket.orders += 1;
    }
  }

  return Array.from(buckets.values());
}

export async function getEnrollmentChart() {
  const months = buildMonthRange(6);
  const fromDate = months[0].date;
  const enrollments = await Enrollment.find({
    createdAt: { $gte: fromDate },
  }).select('createdAt status');

  const buckets = new Map(
    months.map((month) => [
      month.key,
      { month: month.label, enrollments: 0, completed: 0 },
    ]),
  );

  for (const enrollment of enrollments) {
    const key = monthKey((enrollment as unknown as { createdAt: Date }).createdAt);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.enrollments += 1;

      if (enrollment.status === 'completed') {
        bucket.completed += 1;
      }
    }
  }

  return Array.from(buckets.values());
}

export async function listAdminUsers() {
  const users = await User.find().sort({ createdAt: -1 });
  const countMap = await buildOwnedCourseCountMap(users);

  return users.map((user) => mapAdminUser(user, countMap.get(user._id.toString()) ?? 0));
}

export async function getAdminUserById(userId: string) {
  const user = await findUserByIdOrThrow(userId);
  const ownedCourseCount = await getOwnedCourseCountForUser(user);
  return mapAdminUser(user, ownedCourseCount);
}

export async function updateAdminUser(userId: string, input: UpdateAdminUserInput, currentAdminId: string) {
  const user = await findUserByIdOrThrow(userId);

  if (input.email && input.email !== user.email) {
    const existing = await User.findOne({ email: input.email, _id: { $ne: userId } });

    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
    }
  }

  if (userId === currentAdminId && input.isActive === false) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot deactivate your own admin account');
  }

  Object.assign(user, {
    ...(typeof input.fullName === 'string' ? { fullName: input.fullName } : {}),
    ...(typeof input.email === 'string' ? { email: input.email } : {}),
    ...(typeof input.role === 'string' ? { role: input.role } : {}),
    ...(typeof input.avatarUrl === 'string' ? { avatarUrl: input.avatarUrl } : {}),
    ...(typeof input.phone === 'string' ? { phone: input.phone } : {}),
    ...(typeof input.bio === 'string' ? { bio: input.bio } : {}),
    ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
  });

  await user.save();
  const ownedCourseCount = await getOwnedCourseCountForUser(user);
  return mapAdminUser(user, ownedCourseCount);
}

export async function deactivateAdminUser(userId: string, currentAdminId: string) {
  const user = await findUserByIdOrThrow(userId);

  if (userId === currentAdminId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot deactivate your own admin account');
  }

  user.isActive = false;
  user.refreshToken = undefined;
  await user.save();

  const ownedCourseCount = await getOwnedCourseCountForUser(user);
  return mapAdminUser(user, ownedCourseCount);
}
