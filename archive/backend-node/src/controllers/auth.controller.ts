import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import {
  changeCurrentUserPassword,
  confirmCurrentUserEmailChange,
  confirmCurrentUserPhoneChange,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  requestCurrentUserEmailChange,
  requestCurrentUserPhoneChange,
  updateCurrentUserProfile,
} from '../services/auth.service.js';
import { emitActionFailure } from '../services/notification-events.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function register(req: Request, res: Response): Promise<Response> {
  const data = await registerUser(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Register successful', data);
}

export async function login(req: Request, res: Response): Promise<Response> {
  const data = await loginUser(req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Login successful', data);
}

export async function logout(req: Request, res: Response): Promise<Response> {
  await logoutUser(req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Logout successful', {});
}

export async function me(req: Request, res: Response): Promise<Response> {
  const data = await getCurrentUser(req.user!.userId);
  return sendSuccess(res, HTTP_STATUS.OK, 'Current user fetched successfully', data);
}

export async function refreshToken(req: Request, res: Response): Promise<Response> {
  const data = await refreshUserToken(req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Refresh token successful', data);
}

export async function updateProfile(req: Request, res: Response): Promise<Response> {
  try {
    const data = await updateCurrentUserProfile(req.user!.userId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Profile updated successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Cap nhat thong tin that bai', 'Khong the cap nhat thong tin ca nhan luc nay.', 'profile');
    throw error;
  }
}

export async function changePassword(req: Request, res: Response): Promise<Response> {
  try {
    await changeCurrentUserPassword(req.user!.userId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Password updated successfully', {});
  } catch (error) {
    emitActionFailure(req.user!, 'Doi mat khau that bai', 'Khong the cap nhat mat khau voi thong tin vua nhap.', 'profile');
    throw error;
  }
}

export async function requestEmailChange(req: Request, res: Response): Promise<Response> {
  const data = await requestCurrentUserEmailChange(req.user!.userId, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Email verification code sent successfully', data);
}

export async function confirmEmailChange(req: Request, res: Response): Promise<Response> {
  try {
    const data = await confirmCurrentUserEmailChange(req.user!.userId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Email updated successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Cap nhat email that bai', 'Khong the xac nhan thay doi email.', 'profile');
    throw error;
  }
}

export async function requestPhoneChange(req: Request, res: Response): Promise<Response> {
  const data = await requestCurrentUserPhoneChange(req.user!.userId, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Phone OTP sent successfully', data);
}

export async function confirmPhoneChange(req: Request, res: Response): Promise<Response> {
  try {
    const data = await confirmCurrentUserPhoneChange(req.user!.userId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Phone updated successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Cap nhat so dien thoai that bai', 'Khong the xac nhan thay doi so dien thoai.', 'profile');
    throw error;
  }
}
