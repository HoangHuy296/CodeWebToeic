// Route-level RBAC guard. Requires `verifyToken` to have already attached `req.user`.
import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { UserRole } from '../types/auth.js';
import { ApiError } from '../utils/api-error.js';

export function checkRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to access this resource'));
      return;
    }

    next();
  };
}
