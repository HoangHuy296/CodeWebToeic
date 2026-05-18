// Converts unmatched Express routes into the same JSON 404 shape used by the rest of the API.
import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`));
}
