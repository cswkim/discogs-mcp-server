import { homedir } from 'os';
import { join } from 'path';

/**
 * OAuth 1.0a consumer credentials for the Discogs application
 */
export const OAUTH_CONSUMER_KEY = 'vzqcJbpNTzntbmKYoxhP';
export const OAUTH_CONSUMER_SECRET = 'LUYbUNwcgkCBhNbbYAGrYnQbOHvRhKFN';

/**
 * Discogs OAuth endpoint URLs
 */
export const OAUTH_ENDPOINTS = {
  /** Request token endpoint (step 1 of OAuth flow) */
  requestToken: 'https://api.discogs.com/oauth/request_token',
  /** User authorization URL (step 2 - user visits this) */
  authorize: 'https://www.discogs.com/oauth/authorize',
  /** Access token endpoint (step 3 of OAuth flow) */
  accessToken: 'https://api.discogs.com/oauth/access_token',
  /** Identity verification endpoint */
  identity: 'https://api.discogs.com/oauth/identity',
} as const;

/**
 * Path to the OAuth token cache file
 * Stored in user's home directory to persist across sessions
 */
export const OAUTH_CACHE_FILE_PATH = join(homedir(), '.discogs_oauth_cache.json');

/**
 * OAuth callback server configuration
 */
export const OAUTH_CALLBACK_CONFIG = {
  /** Timeout for waiting for OAuth callback (5 minutes) */
  timeoutMs: 5 * 60 * 1000,
  /** Callback path that Discogs will redirect to */
  callbackPath: '/oauth/callback',
} as const;
