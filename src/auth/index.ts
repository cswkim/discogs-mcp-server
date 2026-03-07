import { config } from '../config.js';
import { log } from '../utils.js';
import type { AuthCredentials } from './types.js';
import { buildOAuthHeader } from './oauth-signer.js';
import { performOAuthFlow } from './oauth-flow.js';
import { setAuthCredentials } from './provider.js';

export { setAuthCredentials, getAuthCredentials, ensureAuth } from './provider.js';
export type { AuthMode, AuthCredentials, OAuthTokenCache } from './types.js';

/**
 * Creates token-based authentication credentials
 */
function createTokenCredentials(token: string): AuthCredentials {
  return {
    mode: 'token',
    getAuthorizationHeader: () => `Discogs token=${token}`,
  };
}

/**
 * Creates OAuth-based authentication credentials
 */
function createOAuthCredentials(accessToken: string, accessTokenSecret: string): AuthCredentials {
  return {
    mode: 'oauth',
    getAuthorizationHeader: () => buildOAuthHeader(accessToken, accessTokenSecret),
  };
}

/**
 * Initializes authentication based on the configured mode
 * Called lazily on first API request via ensureAuth()
 *
 * @returns Promise resolving to the authentication credentials
 */
export async function initializeAuth(): Promise<AuthCredentials> {
  const { authMode, personalAccessToken } = config.discogs;

  log.info(`Auth: Mode is "${authMode}"`);

  // Token mode - use personal access token (validated at startup)
  if (authMode === 'token') {
    log.info('Auth: Using Personal Access Token');
    const credentials = createTokenCredentials(personalAccessToken!);
    setAuthCredentials(credentials);
    return credentials;
  }

  // OAuth mode - always use OAuth flow
  if (authMode === 'oauth') {
    log.info('Auth: Using OAuth 1.0a');
    const tokenCache = await performOAuthFlow();
    const credentials = createOAuthCredentials(
      tokenCache.accessToken,
      tokenCache.accessTokenSecret,
    );
    setAuthCredentials(credentials);
    return credentials;
  }

  // Auto mode - prefer token if available, fall back to OAuth
  if (personalAccessToken) {
    log.info('Auth: Auto mode - using Personal Access Token');
    const credentials = createTokenCredentials(personalAccessToken);
    setAuthCredentials(credentials);
    return credentials;
  }

  log.info('Auth: Auto mode - no token found, using OAuth 1.0a');
  const tokenCache = await performOAuthFlow();
  const credentials = createOAuthCredentials(tokenCache.accessToken, tokenCache.accessTokenSecret);
  setAuthCredentials(credentials);
  return credentials;
}
