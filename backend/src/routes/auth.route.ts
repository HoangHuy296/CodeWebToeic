import { Router } from 'express';
import {
  changePassword,
  confirmEmailChange,
  confirmPhoneChange,
  login,
  logout,
  me,
  refreshToken,
  register,
  requestEmailChange,
  requestPhoneChange,
  updateProfile,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  changePasswordSchema,
  confirmEmailChangeSchema,
  confirmPhoneChangeSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  requestEmailChangeSchema,
  requestPhoneChangeSchema,
  updateProfileSchema,
} from '../validations/auth.validation.js';
import { asyncHandler } from '../utils/async-handler.js';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(register));
authRouter.post('/login', validate(loginSchema), asyncHandler(login));
authRouter.post('/logout', validate(logoutSchema), asyncHandler(logout));
authRouter.get('/me', verifyToken, asyncHandler(me));
authRouter.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(refreshToken));
authRouter.patch('/me/profile', verifyToken, validate(updateProfileSchema), asyncHandler(updateProfile));
authRouter.post('/me/password', verifyToken, validate(changePasswordSchema), asyncHandler(changePassword));
authRouter.post('/me/email-change/request', verifyToken, validate(requestEmailChangeSchema), asyncHandler(requestEmailChange));
authRouter.post('/me/email-change/confirm', verifyToken, validate(confirmEmailChangeSchema), asyncHandler(confirmEmailChange));
authRouter.post('/me/phone-change/request', verifyToken, validate(requestPhoneChangeSchema), asyncHandler(requestPhoneChange));
authRouter.post('/me/phone-change/confirm', verifyToken, validate(confirmPhoneChangeSchema), asyncHandler(confirmPhoneChange));

export { authRouter };
