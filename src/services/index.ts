import { config } from '../config.js';
import { createDiscogsError } from '../errors.js';
import { ensureAuth, getAuthCredentials } from '../auth/index.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

// Base service with common functionality
export abstract class DiscogsService {
  protected readonly baseUrl: string;

  protected constructor(protected readonly servicePath: string) {
    if (!config.discogs.apiUrl || !config.discogs.mediaType || !config.discogs.userAgent) {
      throw new Error('Discogs API configuration is incomplete');
    }

    this.baseUrl = `${config.discogs.apiUrl}${servicePath}`;
  }

  /**
   * Gets the current request headers, including dynamic auth header
   */
  protected getHeaders(): Record<string, string> {
    return {
      Accept: config.discogs.mediaType,
      Authorization: getAuthCredentials().getAuthorizationHeader(),
      'Content-Type': 'application/json',
      'User-Agent': config.discogs.userAgent,
    };
  }

  protected async request<T>(path: string, options?: RequestOptions): Promise<T> {
    // Ensure authentication is initialized before making requests
    await ensureAuth();

    const url = new URL(`${this.baseUrl}${path}`);

    // Add query parameters if they exist
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Set default per_page if not specified
    if (!url.searchParams.has('per_page')) {
      url.searchParams.append('per_page', String(config.discogs.defaultPerPage));
    }

    const response = await fetch(url.toString(), {
      method: options?.method || 'GET',
      headers: this.getHeaders(),
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
