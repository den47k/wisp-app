import { AxiosError } from 'axios';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

export class ApiResponseShapeError extends Error {
  constructor(
    public endpoint: string,
    public zodError: ZodError,
  ) {
    super(`Response shape mismatch at ${endpoint}: ${zodError.message}`);
    this.name = 'ApiResponseShapeError';
  }
}

export const toApiError = (e: unknown): ApiError | ApiValidationError | Error => {
  if (e instanceof AxiosError && e.response) {
    const status = e.response.status;
    const data = e.response.data as { message?: string; errors?: Record<string, string[]> };
    if (status === 422 && data?.errors) {
      return new ApiValidationError(data.message ?? 'Validation failed', data.errors, status);
    }
    return new ApiError(data?.message ?? e.message, status, data);
  }
  return e instanceof Error ? e : new Error(String(e));
};
