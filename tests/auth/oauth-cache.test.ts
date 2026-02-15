import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import type { OAuthTokenCache, EncryptedOAuthCache } from '../../src/auth/types.js';

// Mock the oauth-constants module
vi.mock('../../src/auth/oauth-constants.js', () => ({
  OAUTH_CONSUMER_SECRET: 'test-consumer-secret-for-encryption',
  OAUTH_CACHE_FILE_PATH: '/tmp/test-oauth-cache.json',
}));

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

describe('OAuth Cache', () => {
  let readCachedTokens: () => OAuthTokenCache | null;
  let writeCachedTokens: (tokens: OAuthTokenCache) => void;
  let deleteCachedTokens: () => void;

  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();

    // Import fresh module for each test
    const cacheModule = await import('../../src/auth/oauth-cache.js');
    readCachedTokens = cacheModule.readCachedTokens;
    writeCachedTokens = cacheModule.writeCachedTokens;
    deleteCachedTokens = cacheModule.deleteCachedTokens;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('readCachedTokens', () => {
    it('should return null if cache file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = readCachedTokens();

      expect(result).toBeNull();
      expect(existsSync).toHaveBeenCalled();
    });

    it('should return null if cache file is invalid JSON', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json');

      const result = readCachedTokens();

      expect(result).toBeNull();
    });

    it('should return null if cache structure is invalid', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          version: 2, // Wrong version
          iv: 'abc',
          salt: 'def',
          authTag: 'ghi',
          encryptedData: 'jkl',
        }),
      );

      const result = readCachedTokens();

      expect(result).toBeNull();
    });

    it('should return null if cache is missing required fields', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          version: 1,
          iv: 'abc',
          // Missing salt, authTag, encryptedData
        }),
      );

      const result = readCachedTokens();

      expect(result).toBeNull();
    });

    it('should return null if decryption fails', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          version: 1,
          iv: 'invalidiv',
          salt: 'invalidsalt',
          authTag: 'invalidtag',
          encryptedData: 'invaliddata',
        }),
      );

      const result = readCachedTokens();

      expect(result).toBeNull();
    });
  });

  describe('writeCachedTokens', () => {
    it('should write encrypted tokens to file', () => {
      const tokens: OAuthTokenCache = {
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-secret',
        username: 'testuser',
        obtainedAt: Date.now(),
      };

      writeCachedTokens(tokens);

      expect(writeFileSync).toHaveBeenCalledTimes(1);
      const [filePath, content] = vi.mocked(writeFileSync).mock.calls[0];

      expect(filePath).toBe('/tmp/test-oauth-cache.json');

      // Parse the written content
      const encrypted: EncryptedOAuthCache = JSON.parse(content as string);
      expect(encrypted.version).toBe(1);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
      expect(encrypted.encryptedData).toBeDefined();

      // Verify hex encoding
      expect(encrypted.iv).toMatch(/^[0-9a-f]+$/i);
      expect(encrypted.salt).toMatch(/^[0-9a-f]+$/i);
      expect(encrypted.authTag).toMatch(/^[0-9a-f]+$/i);
      expect(encrypted.encryptedData).toMatch(/^[0-9a-f]+$/i);
    });
  });

  describe('deleteCachedTokens', () => {
    it('should delete cache file if it exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      deleteCachedTokens();

      expect(unlinkSync).toHaveBeenCalledWith('/tmp/test-oauth-cache.json');
    });

    it('should not throw if cache file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      expect(() => deleteCachedTokens()).not.toThrow();
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('round-trip encryption/decryption', () => {
    it('should encrypt and decrypt tokens correctly', () => {
      const originalTokens: OAuthTokenCache = {
        accessToken: 'my-access-token',
        accessTokenSecret: 'my-access-secret',
        username: 'myuser',
        obtainedAt: 1705320000000,
      };

      // Capture what gets written
      let writtenContent: string = '';
      vi.mocked(writeFileSync).mockImplementation((_path, content) => {
        writtenContent = content as string;
      });

      writeCachedTokens(originalTokens);

      // Now mock readFileSync to return what was written
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(writtenContent);

      const readTokens = readCachedTokens();

      expect(readTokens).not.toBeNull();
      expect(readTokens?.accessToken).toBe(originalTokens.accessToken);
      expect(readTokens?.accessTokenSecret).toBe(originalTokens.accessTokenSecret);
      expect(readTokens?.username).toBe(originalTokens.username);
      expect(readTokens?.obtainedAt).toBe(originalTokens.obtainedAt);
    });

    it('should handle special characters in tokens', () => {
      const originalTokens: OAuthTokenCache = {
        accessToken: 'token+with=special&chars/and"quotes',
        accessTokenSecret: 'secret\nwith\ttabs',
        username: 'user@example.com',
        obtainedAt: Date.now(),
      };

      let writtenContent: string = '';
      vi.mocked(writeFileSync).mockImplementation((_path, content) => {
        writtenContent = content as string;
      });

      writeCachedTokens(originalTokens);

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(writtenContent);

      const readTokens = readCachedTokens();

      expect(readTokens?.accessToken).toBe(originalTokens.accessToken);
      expect(readTokens?.accessTokenSecret).toBe(originalTokens.accessTokenSecret);
      expect(readTokens?.username).toBe(originalTokens.username);
    });
  });
});
