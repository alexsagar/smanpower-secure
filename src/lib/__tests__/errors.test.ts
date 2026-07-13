import { describe, expect, it } from 'vitest';
import { AppError, ValidationError, NotFoundError, formatErrorResponse } from '../errors';

describe('Error Contract', () => {
  it('ValidationError preserves status code 400', () => {
    const err = new ValidationError('Invalid data');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('NotFoundError preserves status code 404', () => {
    const err = new NotFoundError('Item not found');
    expect(err.statusCode).toBe(404);
  });

  it('formatErrorResponse generic masking', () => {
    const rawError = new Error('Database connection failed to 10.0.0.1 with credentials');
    const response = formatErrorResponse(rawError);
    // Should be a NextResponse object. We can check its structure if we mock it, or just verify AppError masks it.
    expect(response.error.message).toBe('An unexpected internal error occurred.');
  });
});
