import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiscogsError } from '../../src/errors.js';
import { DiscogsService, RequestOptions } from '../../src/services/index.js';

// Mock the config
vi.mock('../../src/config.js', () => ({
  config: {
    discogs: {
      apiUrl: process.env.DISCOGS_API_URL,
      mediaType: process.env.DISCOGS_MEDIA_TYPE,
      personalAccessToken: process.env.DISCOGS_PERSONAL_ACCESS_TOKEN,
      userAgent: process.env.DISCOGS_USER_AGENT,
      defaultPerPage: 5,
    },
  },
}));

// Mock the errors module
vi.mock('../../src/errors.js', () => ({
  createDiscogsError: vi.fn(
    (status, body) => new Error(`Discogs error ${status}: ${JSON.stringify(body)}`),
  ),
}));

// Create a concrete implementation of the abstract class for testing
class TestDiscogsService extends DiscogsService {
  constructor() {
    super('/test');
  }

  public async testRequest<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, options);
  }
}

describe('DiscogsService', () => {
  let service: TestDiscogsService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Set up fetch mock
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    // Create instance of test service
    service = new TestDiscogsService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with correct base URL and headers', () => {
    expect(service['baseUrl']).toBe('https://api.discogs.com/test');
    expect(service['headers']).toEqual({
      Accept: 'application/json',
      Authorization: 'Discogs token=test-token',
      'Content-Type': 'application/json',
      'User-Agent': 'TestApp/1.0',
    });
  });

  it('should make a GET request with the correct parameters', async () => {
    // Setup mock response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({ data: 'test' }),
    };
    fetchMock.mockResolvedValue(mockResponse);

    // Call the method
    const result = await service.testRequest('/items', {
      params: { page: 1, sort: 'name' },
    });

    // Verify the URL and request options
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.discogs.com/test/items?page=1&sort=name&per_page=5',
      {
        method: 'GET',
        headers: service['headers'],
        body: undefined,
      },
    );

    // Verify the result
    expect(result).toEqual({ data: 'test' });
  });

  it('should make a POST request with body', async () => {
    // Setup mock response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({ success: true }),
    };
    fetchMock.mockResolvedValue(mockResponse);

    const requestBody = { name: 'Test Item' };

    // Call the method
    await service.testRequest('/items', {
      method: 'POST',
      body: requestBody,
    });

    // Verify request was made correctly
    expect(fetchMock).toHaveBeenCalledWith('https://api.discogs.com/test/items?per_page=5', {
      method: 'POST',
      headers: service['headers'],
      body: JSON.stringify(requestBody),
    });
  });

  it('should handle error responses', async () => {
    // Setup mock error response
    const errorBody = { message: 'Not found' };
    const mockResponse = {
      ok: false,
      status: 404,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue(errorBody),
    };
    fetchMock.mockResolvedValue(mockResponse);

    // Call the method and expect it to throw
    await expect(service.testRequest('/unknown')).rejects.toThrow();

    // Verify error was created
    expect(createDiscogsError).toHaveBeenCalledWith(404, errorBody);
  });

  it('should handle non-JSON responses', async () => {
    // Setup mock text response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('text/plain'),
      },
      text: vi.fn().mockResolvedValue('Plain text response'),
    };
    fetchMock.mockResolvedValue(mockResponse);

    // Call the method
    const result = await service.testRequest('/text');

    // Verify result
    expect(result).toBe('Plain text response');
  });

  it('should handle JSON parse errors', async () => {
    // Setup mock response with JSON parse error
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };
    fetchMock.mockResolvedValue(mockResponse);

    // Call the method
    const result = await service.testRequest('/bad-json');

    // Verify default error message is used
    expect(result).toEqual({ message: 'Failed to parse response' });
  });
});
