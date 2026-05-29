// Contact inbox plus internal messaging permissions between admin, teacher and student roles.
import { Course, Enrollment, Message, User } from '../models/index.js';
import { MarkMessageReadInput, CreateInternalMessageInput, CreateMessageInput } from '../validations/message.validation.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';
import { AuthUser } from '../types/auth.js';
import { emitInternalMessageReceived } from './notification-events.service.js';

function mapMessage(message: Awaited<ReturnType<typeof Message.findOne>> extends infer T ? T : never) {
  const resolved = message as NonNullable<typeof message>;
  const assignedTo = resolved.assignedTo as unknown;
  const recipientUser = resolved.recipientUser as unknown;
  const senderUser = resolved.senderUser as unknown;

  return {
    id: resolved._id.toString(),
    name: resolved.name,
    email: resolved.email,
    phone: resolved.phone,
    subject: resolved.subject,
    content: resolved.content,
    summary: resolved.summary,
    status: resolved.status,
    messageType: resolved.messageType,
    recipientRole: resolved.recipientRole,
    readAt: resolved.readAt,
    repliedAt: resolved.repliedAt,
    assignedTo:
      assignedTo && typeof assignedTo === 'object' && '_id' in (assignedTo as Record<string, unknown>)
        ? {
            id: String((assignedTo as { _id: unknown })._id),
            fullName:
              'fullName' in (assignedTo as Record<string, unknown>)
                ? String((assignedTo as { fullName?: unknown }).fullName ?? '')
                : undefined,
            email:
              'email' in (assignedTo as Record<string, unknown>)
                ? String((assignedTo as { email?: unknown }).email ?? '')
                : undefined,
          }
        : assignedTo
          ? { id: String(assignedTo) }
          : undefined,
    recipientUser:
      recipientUser && typeof recipientUser === 'object' && '_id' in (recipientUser as Record<string, unknown>)
        ? {
            id: String((recipientUser as { _id: unknown })._id),
            fullName:
              'fullName' in (recipientUser as Record<string, unknown>)
                ? String((recipientUser as { fullName?: unknown }).fullName ?? '')
                : undefined,
            email:
              'email' in (recipientUser as Record<string, unknown>)
                ? String((recipientUser as { email?: unknown }).email ?? '')
                : undefined,
            role:
              'role' in (recipientUser as Record<string, unknown>)
                ? String((recipientUser as { role?: unknown }).role ?? '')
                : undefined,
          }
        : recipientUser
          ? { id: String(recipientUser) }
          : undefined,
    senderUser:
      senderUser && typeof senderUser === 'object' && '_id' in (senderUser as Record<string, unknown>)
        ? {
            id: String((senderUser as { _id: unknown })._id),
            fullName:
              'fullName' in (senderUser as Record<string, unknown>)
                ? String((senderUser as { fullName?: unknown }).fullName ?? '')
                : undefined,
            email:
              'email' in (senderUser as Record<string, unknown>)
                ? String((senderUser as { email?: unknown }).email ?? '')
                : undefined,
            role:
              'role' in (senderUser as Record<string, unknown>)
                ? String((senderUser as { role?: unknown }).role ?? '')
                : undefined,
          }
        : senderUser
          ? { id: String(senderUser) }
          : undefined,
    createdAt: (resolved as unknown as { createdAt?: Date }).createdAt,
  };
}

async function findMessageByIdOrThrow(messageId: string) {
  const message = await Message.findById(messageId)
    .populate('assignedTo', 'fullName email role')
    .populate('recipientUser', 'fullName email role')
    .populate('senderUser', 'fullName email role');

  if (!message) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Message not found');
  }

  return message;
}

function buildMessageSummary(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}

export async function listMessages(user: AuthUser) {
  const query =
    user.role === 'admin'
      ? {}
      : {
          $or: [{ recipientUser: user.userId }, { assignedTo: user.userId }],
        };

  const messages = await Message.find(query)
    .populate('assignedTo', 'fullName email role')
    .populate('recipientUser', 'fullName email role')
    .populate('senderUser', 'fullName email role')
    .sort({ createdAt: -1 });
  return messages.map((message) => mapMessage(message));
}

export async function createMessage(input: CreateMessageInput) {
  const message = await Message.create({
    ...input,
    summary: buildMessageSummary(input.content),
    messageType: 'contact',
    status: 'unread',
  });

  const created = await findMessageByIdOrThrow(message._id.toString());
  return mapMessage(created);
}

export async function createInternalMessage(input: CreateInternalMessageInput, user: AuthUser) {
  const recipientUser = await User.findById(input.recipientUserId);

  if (!recipientUser) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Recipient user not found');
  }

  if (user.role === 'teacher' && recipientUser.role === 'teacher') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Teachers can only message admins or their students');
  }

  if (user.role === 'student' && recipientUser.role === 'student') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Students can only message admins or teachers of their enrolled courses');
  }

  if (user.role === 'teacher' && recipientUser.role === 'student') {
    // Teachers can only contact students who are actually enrolled in one of their courses.
    const ownedCourseIds = await Course.find({ owner: user.userId }).distinct('_id');
    const hasSharedCourse = await Enrollment.exists({
      student: recipientUser._id,
      course: {
        $in: ownedCourseIds,
      },
      status: { $in: ['active', 'completed'] },
    });

    if (!hasSharedCourse) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Teacher can only message students enrolled in their courses');
    }
  }

  if (user.role === 'student' && recipientUser.role === 'teacher') {
    // Students can only contact teachers tied to courses they currently own through enrollment.
    const enrolledCourseIds = await Enrollment.find({
      student: user.userId,
      status: { $in: ['active', 'completed'] },
    }).distinct('course');
    const teacherOwnsEnrolledCourse = await Course.exists({
      _id: { $in: enrolledCourseIds },
      owner: recipientUser._id,
    });

    if (!teacherOwnsEnrolledCourse) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Student can only message teachers who own enrolled courses');
    }
  }

  const message = await Message.create({
    name: recipientUser.fullName,
    email: recipientUser.email,
    phone: recipientUser.phone,
    subject: input.subject,
    content: input.content,
    summary: buildMessageSummary(input.content),
    status: 'unread',
    messageType: 'internal',
    recipientRole: recipientUser.role,
    recipientUser: recipientUser._id,
    senderUser: user.userId,
    assignedTo: user.userId,
  });

  const created = await findMessageByIdOrThrow(message._id.toString());
  emitInternalMessageReceived({
    sender: user,
    recipientUserId: recipientUser._id.toString(),
    recipientRole: recipientUser.role,
    recipientName: recipientUser.fullName,
    subject: input.subject,
  });
  return mapMessage(created);
}

export async function listAvailableMessageRecipients(user: AuthUser) {
  if (user.role === 'admin') {
    const users = await User.find({ role: { $in: ['teacher', 'student'] }, isActive: true })
      .select('fullName email role')
      .sort({ role: 1, fullName: 1 });

    return users.map((item) => ({
      id: item._id.toString(),
      fullName: item.fullName,
      email: item.email,
      role: item.role,
    }));
  }

  if (user.role === 'teacher') {
    const [admins, studentIds] = await Promise.all([
      User.find({ role: 'admin', isActive: true }).select('fullName email role').sort({ fullName: 1 }),
      Enrollment.find({ status: { $in: ['active', 'completed'] } })
        .where('course')
        .in(await Course.find({ owner: user.userId }).distinct('_id'))
        .distinct('student'),
    ]);

    const students = studentIds.length
      ? await User.find({ _id: { $in: studentIds }, role: 'student', isActive: true })
          .select('fullName email role')
          .sort({ fullName: 1 })
      : [];

    return [...admins, ...students].map((item) => ({
      id: item._id.toString(),
      fullName: item.fullName,
      email: item.email,
      role: item.role,
    }));
  }

  if (user.role === 'student') {
    const [admins, teacherIds] = await Promise.all([
      User.find({ role: 'admin', isActive: true }).select('fullName email role').sort({ fullName: 1 }),
      Course.find({
        _id: {
          $in: await Enrollment.find({
            student: user.userId,
            status: { $in: ['active', 'completed'] },
          }).distinct('course'),
        },
      }).distinct('owner'),
    ]);

    const teachers = teacherIds.length
      ? await User.find({ _id: { $in: teacherIds }, role: 'teacher', isActive: true })
          .select('fullName email role')
          .sort({ fullName: 1 })
      : [];

    return [...admins, ...teachers].map((item) => ({
      id: item._id.toString(),
      fullName: item.fullName,
      email: item.email,
      role: item.role,
    }));
  }

  return [];
}

export async function markMessageRead(messageId: string, input: MarkMessageReadInput, user: AuthUser) {
  const message = await findMessageByIdOrThrow(messageId);
  const nextStatus = input.status ?? 'read';

  message.status = nextStatus;
  message.assignedTo = user.userId as never;
  message.readAt = nextStatus === 'read' || nextStatus === 'replied' ? new Date() : message.readAt;
  message.repliedAt = nextStatus === 'replied' ? new Date() : message.repliedAt;

  await message.save();
  const updated = await findMessageByIdOrThrow(messageId);
  return mapMessage(updated);
}
