/**
 * Authentication mode for the Discogs API
 * - 'token': Use Personal Access Token (existing method)
 * - 'oauth': Use OAuth 1.0a flow
 * - 'auto': Auto-detect (use token if available, else OAuth)
 */
export type AuthMode = 'token' | 'oauth' | 'auto';

/**
 * Interface for authentication credentials
 * Provides a unified way to get authorization headers regardless of auth method
 */
export interface AuthCredentials {
  /** The authentication mode being used */
  mode: AuthMode;
  /** Returns the Authorization header value for API requests */
  getAuthorizationHeader(): string;
}

/**
 * OAuth token cache structure for storing access tokens
 */
export interface OAuthTokenCache {
  /** OAuth access token */
  accessToken: string;
  /** OAuth access token secret */
  accessTokenSecret: string;
  /** Discogs username associated with the token */
  username: string;
  /** Timestamp when the token was obtained */
  obtainedAt: number;
}

/**
 * Encrypted OAuth cache file structure
 */
export interface EncryptedOAuthCache {
  /** Version of the cache format */
  version: 1;
  /** Initialization vector (hex encoded) */
  iv: string;
  /** Salt used for key derivation (hex encoded) */
  salt: string;
  /** Authentication tag (hex encoded) */
  authTag: string;
  /** Encrypted token data (hex encoded) */
  encryptedData: string;
}
