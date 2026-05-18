// Authentication, token rotation and current-user self-service profile flows.
import bcrypt from 'bcrypt';
import { User, UserHydratedDocument } from '../models/user.model.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';
import { mapUserToAuthPayload, sanitizeUser } from '../utils/auth-user.js';
import {
  ChangePasswordInput,
  ConfirmEmailChangeInput,
  ConfirmPhoneChangeInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  RequestEmailChangeInput,
  RequestPhoneChangeInput,
  UpdateProfileInput,
} from '../validations/auth.validation.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { emitNewUserRegistered, emitProfileUpdated } from './notification-events.service.js';

const SALT_ROUNDS = 10;

interface AuthResponseData {
  user: ReturnType<typeof sanitizeUser>;
  accessToken: string;
  refreshToken: string;
}

interface VerificationRequestResult {
  deliveryTarget: string;
  expiresAt: Date;
  verificationPreviewCode: string;
}

async function buildAuthResponse(userId: string): Promise<AuthResponseData> {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive');
  }

  const payload = mapUserToAuthPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

async function findUserByIdOrThrow(userId: string): Promise<UserHydratedDocument> {
  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive');
  }

  return user;
}

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function registerUser(input: RegisterInput): Promise<AuthResponseData> {
  const existingUser = await User.findOne({ email: input.email });

  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    phone: input.phone,
    role: 'student',
  });

  emitNewUserRegistered(user._id.toString(), user.email, user.fullName);

  return buildAuthResponse(user._id.toString());
}

export async function loginUser(input: LoginInput): Promise<AuthResponseData> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email or password is incorrect');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive');
  }

  const isMatched = await bcrypt.compare(input.password, user.passwordHash);

  if (!isMatched) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email or password is incorrect');
  }

  return buildAuthResponse(user._id.toString());
}

export async function logoutUser(input: RefreshTokenInput): Promise<void> {
  const user = await User.findOne({ refreshToken: input.refreshToken }).select('+refreshToken');

  if (!user) {
    return;
  }

  user.refreshToken = undefined;
  await user.save();
}

export async function getCurrentUser(userId: string) {
  const user = await findUserByIdOrThrow(userId);
  return sanitizeUser(user);
}

export async function refreshUserToken(input: RefreshTokenInput): Promise<AuthResponseData> {
  let payload;

  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const user = await User.findById(payload.userId).select('+refreshToken');

  if (!user || !user.refreshToken || user.refreshToken !== input.refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token is not valid');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive');
  }

  return buildAuthResponse(user._id.toString());
}

export async function updateCurrentUserProfile(userId: string, input: UpdateProfileInput) {
  const user = await findUserByIdOrThrow(userId);

  if (typeof input.fullName === 'string') {
    user.fullName = input.fullName;
  }

  if (typeof input.avatarUrl === 'string') {
    user.avatarUrl = input.avatarUrl.trim() ? input.avatarUrl.trim() : undefined;
  }

  if (typeof input.bio === 'string') {
    user.bio = input.bio.trim() ? input.bio.trim() : undefined;
  }

  await user.save();
  emitProfileUpdated(mapUserToAuthPayload(user), 'profile');
  return sanitizeUser(user);
}

export async function changeCurrentUserPassword(userId: string, input: ChangePasswordInput) {
  const user = await findUserByIdOrThrow(userId);
  const isMatched = await bcrypt.compare(input.currentPassword, user.passwordHash);

  if (!isMatched) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect');
  }

  const isSamePassword = await bcrypt.compare(input.newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'New password must be different from current password');
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await user.save();
  emitProfileUpdated(mapUserToAuthPayload(user), 'password');
}

export async function requestCurrentUserEmailChange(
  userId: string,
  input: RequestEmailChangeInput,
): Promise<VerificationRequestResult> {
  const user = await findUserByIdOrThrow(userId);

  if (user.email === input.newEmail) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'New email must be different from current email');
  }

  const existing = await User.findOne({ email: input.newEmail, _id: { $ne: userId } });

  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
  }

  const verificationCode = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.pendingEmailChange = {
    newEmail: input.newEmail,
    verificationCode,
    expiresAt,
  };

  await user.save();

  return {
    deliveryTarget: input.newEmail,
    expiresAt,
    verificationPreviewCode: verificationCode,
  };
}

export async function confirmCurrentUserEmailChange(
  userId: string,
  input: ConfirmEmailChangeInput,
): Promise<AuthResponseData> {
  const user = await findUserByIdOrThrow(userId);
  const pending = user.pendingEmailChange;

  if (!pending) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No pending email verification request');
  }

  if (pending.newEmail !== input.newEmail) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Pending email does not match');
  }

  if (pending.expiresAt.getTime() < Date.now()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email verification code has expired');
  }

  if (pending.verificationCode !== input.verificationCode) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email verification code is incorrect');
  }

  const existing = await User.findOne({ email: input.newEmail, _id: { $ne: userId } });

  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already exists');
  }

  user.email = input.newEmail;
  user.pendingEmailChange = undefined;
  await user.save();
  emitProfileUpdated(mapUserToAuthPayload(user), 'email');

  return buildAuthResponse(user._id.toString());
}

export async function requestCurrentUserPhoneChange(
  userId: string,
  input: RequestPhoneChangeInput,
): Promise<VerificationRequestResult> {
  const user = await findUserByIdOrThrow(userId);

  if (user.phone === input.newPhone) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'New phone must be different from current phone');
  }

  const otpCode = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.pendingPhoneChange = {
    newPhone: input.newPhone,
    otpCode,
    expiresAt,
  };

  await user.save();

  return {
    deliveryTarget: input.newPhone,
    expiresAt,
    verificationPreviewCode: otpCode,
  };
}

export async function confirmCurrentUserPhoneChange(userId: string, input: ConfirmPhoneChangeInput) {
  const user = await findUserByIdOrThrow(userId);
  const pending = user.pendingPhoneChange;

  if (!pending) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No pending phone verification request');
  }

  if (pending.newPhone !== input.newPhone) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Pending phone does not match');
  }

  if (pending.expiresAt.getTime() < Date.now()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Phone OTP has expired');
  }

  if (pending.otpCode !== input.otpCode) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Phone OTP is incorrect');
  }

  user.phone = input.newPhone;
  user.pendingPhoneChange = undefined;
  await user.save();
  emitProfileUpdated(mapUserToAuthPayload(user), 'phone');

  return sanitizeUser(user);
}
