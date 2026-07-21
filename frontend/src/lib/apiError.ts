import { AxiosError } from 'axios';

/**
 * Normalized application error. Every failure surfaced to the UI is converted
 * into this shape so components and hooks can render consistent error states.
 */
export class ApiError extends Error {
  /** HTTP status code, or 0 for network/timeout failures. */
  readonly status: number;
  /** Machine-readable error code when the backend provides one. */
  readonly code: string | undefined;
  /** Field-level validation errors keyed by field name. */
  readonly fieldErrors: Record<string, string> | undefined;
  /** True when the failure was a network error, timeout, or cancellation. */
  readonly isNetworkError: boolean;

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    fieldErrors?: Record<string, string>;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
    this.isNetworkError = params.isNetworkError ?? false;
  }
}

interface BackendErrorBody {
  message?: string;
  detail?: string;
  error?: string;
  code?: string;
  errors?: Record<string, string | string[]>;
}

function extractFieldErrors(
  errors: Record<string, string | string[]> | undefined,
): Record<string, string> | undefined {
  if (!errors) return undefined;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    result[key] = Array.isArray(value) ? (value[0] ?? 'Invalid value') : value;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/** Convert any thrown value (typically an AxiosError) into an ApiError. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    // No response => network error, timeout, or cancellation.
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      return new ApiError({
        message: isTimeout
          ? 'The request timed out. Please check your connection and try again.'
          : 'Unable to reach the server. Please check your connection and try again.',
        status: 0,
        code: error.code,
        isNetworkError: true,
      });
    }

    const { status, data } = error.response;
    const body = (data ?? {}) as BackendErrorBody;
    const message =
      body.message ||
      body.detail ||
      body.error ||
      defaultMessageForStatus(status) ||
      error.message;

    return new ApiError({
      message,
      status,
      code: body.code,
      fieldErrors: extractFieldErrors(body.errors),
    });
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message, status: 0 });
  }

  return new ApiError({ message: 'An unexpected error occurred.', status: 0 });
}

function defaultMessageForStatus(status: number): string | undefined {
  switch (status) {
    case 400:
      return 'The request was invalid. Please review your input and try again.';
    case 401:
      return 'You need to sign in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'We could not find what you were looking for.';
    case 409:
      return 'This action conflicts with the current state. Please refresh and try again.';
    case 422:
      return 'Some of the information provided was invalid.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'The server ran into a problem. Please try again shortly.';
    default:
      return undefined;
  }
}

/** Convenience guard for consumers that want to branch on ApiError. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
