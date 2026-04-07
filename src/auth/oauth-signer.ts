import { randomBytes } from 'crypto';
import { OAUTH_CONSUMER_KEY, OAUTH_CONSUMER_SECRET } from './oauth-constants.js';

/**
 * Generates a random nonce for OAuth requests
 */
function generateNonce(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Gets the current timestamp in seconds
 */
function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

/**
 * Encodes a value for OAuth (RFC 3986)
 */
function oauthEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * Builds the OAuth Authorization header parameters as an object
 */
function buildOAuthParams(additionalParams: Record<string, string> = {}): Record<string, string> {
  return {
    oauth_consumer_key: OAUTH_CONSUMER_KEY,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'PLAINTEXT',
    oauth_timestamp: getTimestamp(),
    oauth_version: '1.0',
    ...additionalParams,
  };
}

/**
 * Formats OAuth parameters into an Authorization header string
 */
function formatAuthorizationHeader(params: Record<string, string>): string {
  const paramString = Object.entries(params)
    .map(([key, value]) => `${oauthEncode(key)}="${oauthEncode(value)}"`)
    .join(', ');
  return `OAuth ${paramString}`;
}

/**
 * Generates the PLAINTEXT signature for OAuth 1.0a
 * Format: consumer_secret&token_secret (token_secret may be empty)
 */
function generatePlaintextSignature(tokenSecret: string = ''): string {
  return `${oauthEncode(OAUTH_CONSUMER_SECRET)}&${oauthEncode(tokenSecret)}`;
}

/**
 * Builds the OAuth Authorization header for authenticated API requests
 * Used after obtaining access tokens
 *
 * @param accessToken - The OAuth access token
 * @param accessTokenSecret - The OAuth access token secret
 * @returns The Authorization header value
 */
export function buildOAuthHeader(accessToken: string, accessTokenSecret: string): string {
  const params = buildOAuthParams({
    oauth_token: accessToken,
    oauth_signature: generatePlaintextSignature(accessTokenSecret),
  });
  return formatAuthorizationHeader(params);
}

/**
 * Builds the OAuth Authorization header for requesting a request token (step 1)
 *
 * @param callbackUrl - The callback URL for OAuth (where Discogs redirects after auth)
 * @returns The Authorization header value
 */
export function buildRequestTokenHeader(callbackUrl: string): string {
  const params = buildOAuthParams({
    oauth_callback: callbackUrl,
    oauth_signature: generatePlaintextSignature(),
  });
  return formatAuthorizationHeader(params);
}

/**
 * Builds the OAuth Authorization header for exchanging request token for access token (step 3)
 *
 * @param requestToken - The request token obtained in step 1
 * @param requestTokenSecret - The request token secret obtained in step 1
 * @param verifier - The oauth_verifier from the callback
 * @returns The Authorization header value
 */
export function buildAccessTokenHeader(
  requestToken: string,
  requestTokenSecret: string,
  verifier: string,
): string {
  const params = buildOAuthParams({
    oauth_token: requestToken,
    oauth_verifier: verifier,
    oauth_signature: generatePlaintextSignature(requestTokenSecret),
  });
  return formatAuthorizationHeader(params);
}
