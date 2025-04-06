import { UserError } from 'fastmcp';

export class DiscogsError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class DiscogsAuthenticationError extends DiscogsError {
  constructor(message = 'Authentication failed') {
    super(message, 401, { message });
    this.name = new.target.name;
  }
}

export class DiscogsPermissionError extends DiscogsError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, { message });
    this.name = new.target.name;
  }
}

export class DiscogsRateLimitError extends DiscogsError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly resetAt: Date,
  ) {
    super(message, 429, { message, reset_at: resetAt.toISOString() });
    this.name = new.target.name;
  }
}

export class DiscogsResourceNotFoundError extends DiscogsError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 404, { message: `${resource} not found` });
    this.name = new.target.name;
  }
}

/**
 * Creates a specific Discogs error instance based on HTTP status code
 *
 * @param status HTTP status code from the Discogs API response
 * @param response Response data from the Discogs API
 * @returns An appropriate DiscogsError subclass instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDiscogsError(status: number, response: any): DiscogsError {
  switch (status) {
    case 401:
      return new DiscogsAuthenticationError(response?.message);
    case 403:
      return new DiscogsPermissionError(response?.message);
    case 404:
      return new DiscogsResourceNotFoundError(response?.message || 'Resource');
    case 429:
      return new DiscogsRateLimitError(
        response?.message,
        new Date(response?.reset_at || Date.now() + 60000),
      );
    default:
      return new DiscogsError(response?.message || 'Discogs API error', status, response);
  }
}

/**
 * Creates a user-friendly error from any error object
 * This will be displayed cleanly in FastMCP without error class prefixes
 *
 * @param error The error to format
 * @returns A UserError with the original error message
 */
export function formatDiscogsError(error: unknown): UserError {
  let message: string;

  if (error instanceof Error) {
    // For any Error object, use its message directly
    message = error.message;
  } else {
    // For non-Error objects
    message = String(error);
  }

  return new UserError(message);
}

/**
 * Type guard to check if an error is a DiscogsError
 *
 * @param error The error to check
 * @returns True if the error is a DiscogsError or subclass
 */
export function isDiscogsError(error: unknown): error is DiscogsError {
  return error instanceof DiscogsError;
}
