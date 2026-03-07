import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { OAuthTokenCache } from '../../src/auth/types.js';

// Mock dependencies before importing the module
vi.mock('../../src/config.js', () => ({
  config: {
    discogs: {
      userAgent: 'TestAgent/1.0',
    },
  },
}));

vi.mock('../../src/utils.js', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../src/auth/oauth-constants.js', () => ({
  OAUTH_ENDPOINTS: {
    requestToken: 'https://api.discogs.com/oauth/request_token',
    authorize: 'https://www.discogs.com/oauth/authorize',
    accessToken: 'https://api.discogs.com/oauth/access_token',
    identity: 'https://api.discogs.com/oauth/identity',
  },
  OAUTH_CALLBACK_CONFIG: {
    timeoutMs: 1000, // Short timeout for tests
    callbackPath: '/oauth/callback',
  },
}));

vi.mock('../../src/auth/oauth-signer.js', () => ({
  buildRequestTokenHeader: vi.fn(() => 'OAuth request-token-header'),
  buildAccessTokenHeader: vi.fn(() => 'OAuth access-token-header'),
  buildOAuthHeader: vi.fn(() => 'OAuth auth-header'),
}));

vi.mock('../../src/auth/oauth-cache.js', () => ({
  readCachedTokens: vi.fn(),
  writeCachedTokens: vi.fn(),
  deleteCachedTokens: vi.fn(),
}));

vi.mock('get-port-please', () => ({
  getPort: vi.fn(() => Promise.resolve(54321)),
}));

// Mock child_process for browser opening
vi.mock('child_process', () => ({
  exec: vi.fn((_cmd, callback) => callback?.(null, '', '')),
}));

vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}));

describe('OAuth Flow', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let performOAuthFlow: () => Promise<OAuthTokenCache>;
  let verifyCachedTokens: () => Promise<OAuthTokenCache | null>;
  let invalidateOAuthSession: () => void;

  beforeEach(async () => {
    vi.resetModules();

    // Setup fetch mock
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    // Import fresh module
    const flowModule = await import('../../src/auth/oauth-flow.js');
    performOAuthFlow = flowModule.performOAuthFlow;
    verifyCachedTokens = flowModule.verifyCachedTokens;
    invalidateOAuthSession = flowModule.invalidateOAuthSession;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('performOAuthFlow', () => {
    it('should return cached tokens if they are valid', async () => {
      const cachedTokens: OAuthTokenCache = {
        accessToken: 'cached-access-token',
        accessTokenSecret: 'cached-access-secret',
        username: 'cacheduser',
        obtainedAt: Date.now(),
      };

      const { readCachedTokens } = await import('../../src/auth/oauth-cache.js');
      vi.mocked(readCachedTokens).mockReturnValue(cachedTokens);

      // Mock identity verification success
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'cacheduser' }),
      });

      const result = await performOAuthFlow();

      expect(result).toEqual(cachedTokens);
      expect(fetchMock).toHaveBeenCalledTimes(1); // Only identity check
    });

    it('should delete cache when cached tokens are invalid', async () => {
      const cachedTokens: OAuthTokenCache = {
        accessToken: 'invalid-token',
        accessTokenSecret: 'invalid-secret',
        username: 'olduser',
        obtainedAt: Date.now(),
      };

      const { readCachedTokens, deleteCachedTokens } =
        await import('../../src/auth/oauth-cache.js');

      // First call returns cached tokens, second call (after deletion) returns null
      vi.mocked(readCachedTokens).mockReturnValueOnce(cachedTokens).mockReturnValueOnce(null);

      // Mock identity verification failure (token invalid)
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      // Use verifyCachedTokens instead which doesn't start the full flow
      const result = await verifyCachedTokens();

      expect(result).toBeNull();
      expect(deleteCachedTokens).toHaveBeenCalled();
    });
  });

  describe('verifyCachedTokens', () => {
    it('should return null if no cached tokens exist', async () => {
      const { readCachedTokens } = await import('../../src/auth/oauth-cache.js');
      vi.mocked(readCachedTokens).mockReturnValue(null);

      const result = await verifyCachedTokens();

      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return tokens if they are valid', async () => {
      const cachedTokens: OAuthTokenCache = {
        accessToken: 'valid-token',
        accessTokenSecret: 'valid-secret',
        username: 'validuser',
        obtainedAt: Date.now(),
      };

      const { readCachedTokens } = await import('../../src/auth/oauth-cache.js');
      vi.mocked(readCachedTokens).mockReturnValue(cachedTokens);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'validuser' }),
      });

      const result = await verifyCachedTokens();

      expect(result).toEqual(cachedTokens);
    });

    it('should delete cache and return null if tokens are invalid', async () => {
      const cachedTokens: OAuthTokenCache = {
        accessToken: 'expired-token',
        accessTokenSecret: 'expired-secret',
        username: 'expireduser',
        obtainedAt: Date.now(),
      };

      const { readCachedTokens, deleteCachedTokens } =
        await import('../../src/auth/oauth-cache.js');
      vi.mocked(readCachedTokens).mockReturnValue(cachedTokens);

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Token expired'),
      });

      const result = await verifyCachedTokens();

      expect(result).toBeNull();
      expect(deleteCachedTokens).toHaveBeenCalled();
    });
  });

  describe('invalidateOAuthSession', () => {
    it('should delete cached tokens', async () => {
      const { deleteCachedTokens } = await import('../../src/auth/oauth-cache.js');

      invalidateOAuthSession();

      expect(deleteCachedTokens).toHaveBeenCalled();
    });
  });
});

describe('OAuth Flow HTTP Requests', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should verify identity with correct headers when using cached tokens', async () => {
    const cachedTokens: OAuthTokenCache = {
      accessToken: 'test-token',
      accessTokenSecret: 'test-secret',
      username: 'testuser',
      obtainedAt: Date.now(),
    };

    const { readCachedTokens } = await import('../../src/auth/oauth-cache.js');
    vi.mocked(readCachedTokens).mockReturnValue(cachedTokens);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ username: 'testuser' }),
    });

    const flowModule = await import('../../src/auth/oauth-flow.js');
    await flowModule.performOAuthFlow();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.discogs.com/oauth/identity',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'OAuth auth-header',
          'User-Agent': 'TestAgent/1.0',
        }),
      }),
    );
  });
});
