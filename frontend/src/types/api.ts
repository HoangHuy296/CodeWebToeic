export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  code?: string | null;
  message: string;
  errors: ApiErrorItem[];
}
