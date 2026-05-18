import { api, unwrapResponse } from './api';
import type { AuthPayload, LoginInput, PublicUser, RegisterInput } from '../types/auth';
import type {
  ChangePasswordInput,
  UpdateProfileInput,
  VerificationRequestResult,
} from '../types/auth';

export const authApi = {
  login(payload: LoginInput) {
    return unwrapResponse<AuthPayload>(api.post('/auth/login', payload));
  },
  register(payload: RegisterInput) {
    return unwrapResponse<AuthPayload>(api.post('/auth/register', payload));
  },
  me() {
    return unwrapResponse<PublicUser>(api.get('/auth/me'));
  },
  logout(refreshToken: string) {
    return unwrapResponse<Record<string, never>>(api.post('/auth/logout', { refreshToken }));
  },
  refreshToken(refreshToken: string) {
    return unwrapResponse<AuthPayload>(api.post('/auth/refresh-token', { refreshToken }));
  },
  updateProfile(payload: UpdateProfileInput) {
    return unwrapResponse<PublicUser>(api.patch('/auth/me/profile', payload));
  },
  changePassword(payload: ChangePasswordInput) {
    return unwrapResponse<Record<string, never>>(api.post('/auth/me/password', payload));
  },
  requestEmailChange(newEmail: string) {
    return unwrapResponse<VerificationRequestResult>(api.post('/auth/me/email-change/request', { newEmail }));
  },
  confirmEmailChange(newEmail: string, verificationCode: string) {
    return unwrapResponse<AuthPayload>(api.post('/auth/me/email-change/confirm', { newEmail, verificationCode }));
  },
  requestPhoneChange(newPhone: string) {
    return unwrapResponse<VerificationRequestResult>(api.post('/auth/me/phone-change/request', { newPhone }));
  },
  confirmPhoneChange(newPhone: string, otpCode: string) {
    return unwrapResponse<PublicUser>(api.post('/auth/me/phone-change/confirm', { newPhone, otpCode }));
  },
};
