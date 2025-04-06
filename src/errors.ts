export class DiscogsError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: unknown,
  ) {
    super(message);
    this.name = 'DiscogsError';
  }
}

export class DiscogsAuthenticationError extends DiscogsError {
  constructor(message = 'Authentication failed') {
    super(message, 401, { message });
    this.name = 'DiscogsAuthenticationError';
  }
}

export class DiscogsPermissionError extends DiscogsError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, { message });
    this.name = 'DiscogsPermissionError';
  }
}

export class DiscogsRateLimitError extends DiscogsError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly resetAt: Date,
  ) {
    super(message, 429, { message, reset_at: resetAt.toISOString() });
    this.name = 'DiscogsRateLimitError';
  }
}

export class DiscogsResourceNotFoundError extends DiscogsError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 404, { message: `${resource} not found` });
    this.name = 'DiscogsResourceNotFoundError';
  }
}

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

export function isDiscogsError(error: unknown): error is DiscogsError {
  return error instanceof DiscogsError;
}
