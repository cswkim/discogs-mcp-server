import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('Auth Module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initializeAuth', () => {
    beforeEach(() => {
      vi.mock('../../src/utils.js', () => ({
        log: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      }));

      vi.mock('../../src/auth/oauth-flow.js', () => ({
        performOAuthFlow: vi.fn(() =>
          Promise.resolve({
            accessToken: 'oauth-access-token',
            accessTokenSecret: 'oauth-access-secret',
            username: 'oauthuser',
            obtainedAt: Date.now(),
          }),
        ),
      }));

      vi.mock('../../src/auth/oauth-signer.js', () => ({
        buildOAuthHeader: vi.fn(() => 'OAuth mock-header'),
      }));

      vi.mock('../../src/auth/provider.js', () => ({
        setAuthCredentials: vi.fn(),
        getAuthCredentials: vi.fn(),
        ensureAuth: vi.fn(),
      }));
    });

    it('should use token auth when mode is "token" and token is available', async () => {
      vi.doMock('../../src/config.js', () => ({
        config: {
          discogs: {
            authMode: 'token',
            personalAccessToken: 'my-token',
          },
        },
      }));

      const { initializeAuth } = await import('../../src/auth/index.js');
      const { setAuthCredentials } = await import('../../src/auth/provider.js');

      const result = await initializeAuth();

      expect(result.mode).toBe('token');
      expect(result.getAuthorizationHeader()).toBe('Discogs token=my-token');
      expect(setAuthCredentials).toHaveBeenCalled();
    });

    it('should use OAuth when mode is "oauth"', async () => {
      vi.doMock('../../src/config.js', () => ({
        config: {
          discogs: {
            authMode: 'oauth',
            personalAccessToken: undefined,
          },
        },
      }));

      const { initializeAuth } = await import('../../src/auth/index.js');
      const { performOAuthFlow } = await import('../../src/auth/oauth-flow.js');

      const result = await initializeAuth();

      expect(result.mode).toBe('oauth');
      expect(performOAuthFlow).toHaveBeenCalled();
    });

    it('should use token in auto mode when token is available', async () => {
      vi.doMock('../../src/config.js', () => ({
        config: {
          discogs: {
            authMode: 'auto',
            personalAccessToken: 'auto-token',
          },
        },
      }));

      const { initializeAuth } = await import('../../src/auth/index.js');
      const { performOAuthFlow } = await import('../../src/auth/oauth-flow.js');

      const result = await initializeAuth();

      expect(result.mode).toBe('token');
      expect(result.getAuthorizationHeader()).toBe('Discogs token=auto-token');
      expect(performOAuthFlow).not.toHaveBeenCalled();
    });

    it('should use OAuth in auto mode when no token is available', async () => {
      vi.doMock('../../src/config.js', () => ({
        config: {
          discogs: {
            authMode: 'auto',
            personalAccessToken: undefined,
          },
        },
      }));

      const { initializeAuth } = await import('../../src/auth/index.js');
      const { performOAuthFlow } = await import('../../src/auth/oauth-flow.js');

      const result = await initializeAuth();

      expect(result.mode).toBe('oauth');
      expect(performOAuthFlow).toHaveBeenCalled();
    });
  });
});
