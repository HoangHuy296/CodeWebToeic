import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse, ApiSuccessResponse } from '../types/api';
import { getStoredAccessToken } from './storage';

function resolveApiBaseUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredApiUrl) {
    return typeof window === 'undefined' ? 'http://localhost/api' : `${window.location.origin}/api`;
  }

  if (/^https?:\/\//i.test(configuredApiUrl)) {
    return configuredApiUrl;
  }

  if (typeof window === 'undefined') {
    return configuredApiUrl;
  }

  return new URL(configuredApiUrl, window.location.origin).toString();
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

export async function unwrapResponse<T>(promise: Promise<{ data: ApiSuccessResponse<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? error.message;
  }

  return error instanceof Error ? error.message : 'Unexpected error';
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const items = error.response?.data.errors ?? [];
    return items.reduce<Record<string, string>>((accumulator, item) => {
      if (item.field && !accumulator[item.field]) {
        accumulator[item.field] = item.message;
      }

      return accumulator;
    }, {});
  }

  return {};
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    ((error as AxiosError<ApiErrorResponse>).response?.status ?? 0) === 401
  );
}
