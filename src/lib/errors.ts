export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string = 'Configuration error') {
    super(message, 503, 'CONFIGURATION_ERROR');
  }
}

/**
 * Helper to safely format an error for a public API response.
 * Will not expose internal error details unless it's a known AppError (and even then, standardizes the output).
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
  
  // Zod errors are handled separately where safeParse is used, but if thrown:
  // (Assuming we catch them before this, or we could handle ZodError here)

  // Generic fallback
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred.'
    }
  };
}
