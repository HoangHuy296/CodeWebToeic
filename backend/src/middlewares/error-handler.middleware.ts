// Final API error boundary. Everything thrown upstream is normalized into the shared response format here.
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/http-status.js';
import { sendError } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof ZodError) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Validation failed',
      error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : undefined,
        message: issue.message,
      })),
    );
  }

  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, error.message, error.errors);
  }

  console.error(error);

  return sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'Internal server error',
    [],
  );
}
