import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { AuthCredentials } from '../../src/auth/types.js';

describe('Auth Provider', () => {
  let setAuthCredentials: (credentials: AuthCredentials) => void;
  let getAuthCredentials: () => AuthCredentials;
  let hasAuthCredentials: () => boolean;
  let ensureAuth: () => Promise<AuthCredentials>;

  beforeEach(async () => {
    // Reset modules to get fresh singleton state
    vi.resetModules();

    const providerModule = await import('../../src/auth/provider.js');
    setAuthCredentials = providerModule.setAuthCredentials;
    getAuthCredentials = providerModule.getAuthCredentials;
    hasAuthCredentials = providerModule.hasAuthCredentials;
    ensureAuth = providerModule.ensureAuth;
  });

  describe('setAuthCredentials', () => {
    it('should store credentials', () => {
      const credentials = {
        mode: 'token' as const,
        getAuthorizationHeader: () => 'Discogs token=test',
      };

      setAuthCredentials(credentials);

      expect(hasAuthCredentials()).toBe(true);
    });
  });

  describe('getAuthCredentials', () => {
    it('should throw if credentials not initialized', () => {
      expect(() => getAuthCredentials()).toThrow(
        'Authentication credentials not initialized. Call ensureAuth() first.',
      );
    });

    it('should return stored credentials', () => {
      const credentials = {
        mode: 'token' as const,
        getAuthorizationHeader: () => 'Discogs token=mytoken',
      };

      setAuthCredentials(credentials);
      const result = getAuthCredentials();

      expect(result.mode).toBe('token');
      expect(result.getAuthorizationHeader()).toBe('Discogs token=mytoken');
    });
  });

  describe('hasAuthCredentials', () => {
    it('should return false if credentials not set', () => {
      expect(hasAuthCredentials()).toBe(false);
    });

    it('should return true after credentials are set', () => {
      setAuthCredentials({
        mode: 'oauth' as const,
        getAuthorizationHeader: () => 'OAuth ...',
      });

      expect(hasAuthCredentials()).toBe(true);
    });
  });

  describe('ensureAuth', () => {
    it('should return existing credentials if already initialized', async () => {
      const credentials = {
        mode: 'token' as const,
        getAuthorizationHeader: () => 'Discogs token=existing',
      };

      setAuthCredentials(credentials);
      const result = await ensureAuth();

      expect(result.mode).toBe('token');
      expect(result.getAuthorizationHeader()).toBe('Discogs token=existing');
    });

    it('should initialize auth lazily when not yet initialized', async () => {
      // Reset modules to get fresh state
      vi.resetModules();

      // Mock initializeAuth in index.js
      vi.doMock('../../src/auth/index.js', async (importOriginal) => {
        const original = await importOriginal<typeof import('../../src/auth/index.js')>();
        return {
          ...original,
          initializeAuth: vi.fn(() =>
            Promise.resolve({
              mode: 'token' as const,
              getAuthorizationHeader: () => 'Discogs token=lazy-init',
            }),
          ),
        };
      });

      // Also mock the provider module to use the mocked index.js
      vi.doMock('../../src/config.js', () => ({
        config: {
          discogs: {
            authMode: 'token',
            personalAccessToken: 'lazy-init',
          },
        },
      }));

      vi.doMock('../../src/utils.js', () => ({
        log: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      }));

      vi.doMock('../../src/auth/oauth-flow.js', () => ({
        performOAuthFlow: vi.fn(),
      }));

      vi.doMock('../../src/auth/oauth-signer.js', () => ({
        buildOAuthHeader: vi.fn(),
      }));

      const { ensureAuth: freshEnsureAuth } = await import('../../src/auth/provider.js');

      const result = await freshEnsureAuth();

      expect(result.mode).toBe('token');
    });

    it('should only initialize once even with concurrent calls', async () => {
      vi.resetModules();

      vi.doMock('../../src/config.js', () => ({
        config: {
          discogs: {
            authMode: 'token',
            personalAccessToken: 'concurrent-test',
          },
        },
      }));

      vi.doMock('../../src/utils.js', () => ({
        log: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      }));

      vi.doMock('../../src/auth/oauth-flow.js', () => ({
        performOAuthFlow: vi.fn(),
      }));

      vi.doMock('../../src/auth/oauth-signer.js', () => ({
        buildOAuthHeader: vi.fn(),
      }));

      // Re-import after mocking
      const { ensureAuth: freshEnsureAuth } = await import('../../src/auth/provider.js');

      // Spy on initializeAuth
      const { initializeAuth } = await import('../../src/auth/index.js');
      const initSpy = vi.spyOn({ initializeAuth }, 'initializeAuth');
      initSpy.mockImplementation(async () => ({
        mode: 'token' as const,
        getAuthorizationHeader: () => 'Discogs token=concurrent-test',
      }));

      // Make concurrent calls
      const [result1, result2, result3] = await Promise.all([
        freshEnsureAuth(),
        freshEnsureAuth(),
        freshEnsureAuth(),
      ]);

      // All results should be the same
      expect(result1.mode).toBe('token');
      expect(result2.mode).toBe('token');
      expect(result3.mode).toBe('token');
    });
  });
});
