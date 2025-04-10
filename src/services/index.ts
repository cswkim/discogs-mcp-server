import { config } from '../config.js';
import { createDiscogsError } from '../errors.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

// Base service with common functionality
export abstract class DiscogsService {
  protected readonly baseUrl: string;
  protected readonly headers: Record<string, string>;

  protected constructor(protected readonly servicePath: string) {
    if (
      !config.discogs.apiUrl ||
      !config.discogs.mediaType ||
      !config.discogs.personalAccessToken ||
      !config.discogs.userAgent
    ) {
      throw new Error('Discogs API configuration is incomplete');
    }

    this.baseUrl = `${config.discogs.apiUrl}${servicePath}`;
    this.headers = {
      Accept: config.discogs.mediaType,
      Authorization: `Discogs token=${config.discogs.personalAccessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': config.discogs.userAgent,
    };
  }

  protected async request<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    // Add query parameters if they exist
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: options?.method || 'GET',
      headers: this.headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let responseBody;
    try {
      responseBody = isJson ? await response.json() : await response.text();
    } catch {
      // Ignore the error and use default message
      responseBody = { message: 'Failed to parse response' };
    }

    // Check if the response is successful
    if (!response.ok) {
      throw createDiscogsError(response.status, responseBody);
    }

    return responseBody as T;
  }
}

/**
 * Base class for user-related services
 */
export class BaseUserService extends DiscogsService {
  constructor() {
    super('/users');
  }
}
