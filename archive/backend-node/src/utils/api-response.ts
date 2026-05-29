import { Response } from 'express';
import { ApiErrorItem, ApiErrorResponse, ApiSuccessResponse } from '../types/api.js';

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors: ApiErrorItem[] = [],
): Response<ApiErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

