import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  buildOAuthHeader,
  buildRequestTokenHeader,
  buildAccessTokenHeader,
} from '../../src/auth/oauth-signer.js';

// Mock the oauth-constants module
vi.mock('../../src/auth/oauth-constants.js', () => ({
  OAUTH_CONSUMER_KEY: 'test-consumer-key',
  OAUTH_CONSUMER_SECRET: 'test-consumer-secret',
}));

// Mock crypto.randomBytes to return predictable values for testing
vi.mock('crypto', async () => {
  const actual = await vi.importActual('crypto');
  return {
    ...actual,
    randomBytes: vi.fn(() => Buffer.from('1234567890abcdef1234567890abcdef', 'hex')),
  };
});

describe('OAuth Signer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  describe('buildOAuthHeader', () => {
    it('should build a valid OAuth header for authenticated requests', () => {
      const header = buildOAuthHeader('access-token', 'access-token-secret');

      expect(header).toMatch(/^OAuth /);
      expect(header).toContain('oauth_consumer_key="test-consumer-key"');
      expect(header).toContain('oauth_token="access-token"');
      expect(header).toContain('oauth_signature_method="PLAINTEXT"');
      expect(header).toContain('oauth_version="1.0"');
      // PLAINTEXT signature: consumer_secret&token_secret
      expect(header).toContain('oauth_signature="test-consumer-secret%26access-token-secret"');
      expect(header).toContain('oauth_timestamp=');
      expect(header).toContain('oauth_nonce=');
    });

    it('should include timestamp in seconds', () => {
      const header = buildOAuthHeader('token', 'secret');
      // 2024-01-15T12:00:00Z = 1705320000 seconds
      expect(header).toContain('oauth_timestamp="1705320000"');
    });

    it('should URL-encode special characters in tokens', () => {
      const header = buildOAuthHeader('token+with=special&chars', 'secret/with spaces');

      expect(header).toContain('oauth_token="token%2Bwith%3Dspecial%26chars"');
      // The signature is double-encoded (once in signature generation, once in header formatting)
      // So / becomes %2F then %252F, and space becomes %20 then %2520
      expect(header).toContain('oauth_signature=');
    });
  });

  describe('buildRequestTokenHeader', () => {
    it('should build a valid OAuth header for request token', () => {
      const header = buildRequestTokenHeader('http://localhost:8080/callback');

      expect(header).toMatch(/^OAuth /);
      expect(header).toContain('oauth_consumer_key="test-consumer-key"');
      expect(header).toContain('oauth_callback="http%3A%2F%2Flocalhost%3A8080%2Fcallback"');
      expect(header).toContain('oauth_signature_method="PLAINTEXT"');
      expect(header).toContain('oauth_version="1.0"');
      // PLAINTEXT signature with empty token secret: consumer_secret&
      expect(header).toContain('oauth_signature="test-consumer-secret%26"');
      expect(header).not.toContain('oauth_token=');
    });

    it('should URL-encode the callback URL', () => {
      const header = buildRequestTokenHeader('http://localhost:8080/oauth/callback?state=123');

      expect(header).toContain(
        'oauth_callback="http%3A%2F%2Flocalhost%3A8080%2Foauth%2Fcallback%3Fstate%3D123"',
      );
    });
  });

  describe('buildAccessTokenHeader', () => {
    it('should build a valid OAuth header for access token exchange', () => {
      const header = buildAccessTokenHeader('request-token', 'request-token-secret', 'verifier123');

      expect(header).toMatch(/^OAuth /);
      expect(header).toContain('oauth_consumer_key="test-consumer-key"');
      expect(header).toContain('oauth_token="request-token"');
      expect(header).toContain('oauth_verifier="verifier123"');
      expect(header).toContain('oauth_signature_method="PLAINTEXT"');
      expect(header).toContain('oauth_version="1.0"');
      // PLAINTEXT signature: consumer_secret&request_token_secret
      expect(header).toContain('oauth_signature="test-consumer-secret%26request-token-secret"');
    });

    it('should include all required OAuth parameters', () => {
      const header = buildAccessTokenHeader('token', 'secret', 'verifier');

      const requiredParams = [
        'oauth_consumer_key',
        'oauth_token',
        'oauth_verifier',
        'oauth_signature_method',
        'oauth_signature',
        'oauth_timestamp',
        'oauth_nonce',
        'oauth_version',
      ];

      for (const param of requiredParams) {
        expect(header).toContain(param);
      }
    });
  });

  describe('OAuth header format', () => {
    it('should format parameters as key="value" pairs', () => {
      const header = buildOAuthHeader('token', 'secret');

      // Check the format: OAuth key="value", key="value", ...
      const match = header.match(/^OAuth (.+)$/);
      expect(match).not.toBeNull();

      const params = match![1].split(', ');
      for (const param of params) {
        expect(param).toMatch(/^[a-z_]+=".+"$/);
      }
    });

    it('should generate unique nonces for each call', async () => {
      // Reset the mock to return different values
      const crypto = await import('crypto');
      let callCount = 0;
      vi.mocked(crypto.randomBytes).mockImplementation(() => {
        callCount++;
        return Buffer.from(`${callCount}234567890abcdef1234567890abcdef`.slice(0, 32), 'hex');
      });

      const header1 = buildOAuthHeader('token', 'secret');
      const header2 = buildOAuthHeader('token', 'secret');

      const nonce1 = header1.match(/oauth_nonce="([^"]+)"/)?.[1];
      const nonce2 = header2.match(/oauth_nonce="([^"]+)"/)?.[1];

      expect(nonce1).not.toBe(nonce2);
    });
  });
});
