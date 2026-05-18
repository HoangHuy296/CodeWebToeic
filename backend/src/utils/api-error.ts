import { ApiErrorItem } from '../types/api.js';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: ApiErrorItem[];

  constructor(statusCode: number, message: string, errors: ApiErrorItem[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

