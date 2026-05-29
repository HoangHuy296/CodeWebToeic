// Auth middlewares only decode JWT and hydrate `req.user`; authorization stays in route/service guards.
import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/api-error.js';

function resolveBearerToken(authorization?: string): string | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.replace('Bearer ', '').trim();
}

export function verifyToken(req: Request, _res: Response, next: NextFunction): void {
  const token = resolveBearerToken(req.headers.authorization);

  if (!token) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token is required'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token'));
  }
}

export function attachUserIfExists(req: Request, _res: Response, next: NextFunction): void {
  const token = resolveBearerToken(req.headers.authorization);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    req.user = undefined;
  }

  next();
}
