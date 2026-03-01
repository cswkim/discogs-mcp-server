import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import { getPort } from 'get-port-please';
import { config } from '../config.js';
import { OAuthFlowError } from '../errors.js';
import { log } from '../utils.js';
import type { OAuthTokenCache } from './types.js';
import { OAUTH_ENDPOINTS, OAUTH_CALLBACK_CONFIG } from './oauth-constants.js';
import {
  buildRequestTokenHeader,
  buildAccessTokenHeader,
  buildOAuthHeader,
} from './oauth-signer.js';
import { readCachedTokens, writeCachedTokens, deleteCachedTokens } from './oauth-cache.js';

/**
 * Parsed OAuth response from Discogs
 */
interface OAuthResponse {
  oauth_token?: string;
  oauth_token_secret?: string;
  oauth_verifier?: string;
}

/**
 * Discogs identity response
 */
interface IdentityResponse {
  username: string;
  resource_url: string;
  consumer_name: string;
}

/**
 * Parses URL-encoded OAuth response body
 */
function parseOAuthResponse(body: string): OAuthResponse {
  const params = new URLSearchParams(body);
  return {
    oauth_token: params.get('oauth_token') || undefined,
    oauth_token_secret: params.get('oauth_token_secret') || undefined,
    oauth_verifier: params.get('oauth_verifier') || undefined,
  };
}

/**
 * Attempts to open a URL in the user's default browser
 * Falls back to printing the URL if browser opening fails
 */
async function openBrowser(url: string): Promise<void> {
  const { platform } = process;

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    if (platform === 'darwin') {
      await execAsync(`open "${url}"`);
    } else if (platform === 'win32') {
      await execAsync(`start "" "${url}"`);
    } else {
      // Linux and others
      await execAsync(`xdg-open "${url}"`);
    }
    log.info('Browser opened for authorization');
  } catch {
    // Browser opening failed - URL will be printed as fallback
    log.warn('Could not open browser automatically');
  }
}

/**
 * Step 1: Request a request token from Discogs
 */
async function getRequestToken(
  callbackUrl: string,
): Promise<{ token: string; tokenSecret: string }> {
  const authHeader = buildRequestTokenHeader(callbackUrl);

  const response = await fetch(OAUTH_ENDPOINTS.requestToken, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
      'User-Agent': config.discogs.userAgent,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new OAuthFlowError(`Failed to get request token: ${response.status} ${text}`);
  }

  const body = await response.text();
  const parsed = parseOAuthResponse(body);

  if (!parsed.oauth_token || !parsed.oauth_token_secret) {
    throw new OAuthFlowError('Invalid request token response from Discogs');
  }

  return {
    token: parsed.oauth_token,
    tokenSecret: parsed.oauth_token_secret,
  };
}

/**
 * Step 3: Exchange request token + verifier for access token
 */
async function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  verifier: string,
): Promise<{ token: string; tokenSecret: string }> {
  const authHeader = buildAccessTokenHeader(requestToken, requestTokenSecret, verifier);

  const response = await fetch(OAUTH_ENDPOINTS.accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
      'User-Agent': config.discogs.userAgent,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new OAuthFlowError(`Failed to get access token: ${response.status} ${text}`);
  }

  const body = await response.text();
  const parsed = parseOAuthResponse(body);

  if (!parsed.oauth_token || !parsed.oauth_token_secret) {
    throw new OAuthFlowError('Invalid access token response from Discogs');
  }

  return {
    token: parsed.oauth_token,
    tokenSecret: parsed.oauth_token_secret,
  };
}

/**
 * Verifies tokens by calling the identity endpoint
 */
async function verifyIdentity(accessToken: string, accessTokenSecret: string): Promise<string> {
  const authHeader = buildOAuthHeader(accessToken, accessTokenSecret);

  const response = await fetch(OAUTH_ENDPOINTS.identity, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      'User-Agent': config.discogs.userAgent,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new OAuthFlowError(`Failed to verify identity: ${response.status} ${text}`);
  }

  const identity = (await response.json()) as IdentityResponse;
  return identity.username;
}

/**
 * Creates a temporary HTTP server to receive the OAuth callback
 */
function createCallbackServer(port: number): Promise<{ verifier: string }> {
  return new Promise((resolve, reject) => {
    // Use object to hold mutable references for cleanup
    const refs: { timeout: NodeJS.Timeout | null; server: Server | null } = {
      timeout: null,
      server: null,
    };

    const cleanup = () => {
      if (refs.timeout) clearTimeout(refs.timeout);
      if (refs.server) refs.server.close();
    };

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      if (url.pathname !== OAUTH_CALLBACK_CONFIG.callbackPath) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const verifier = url.searchParams.get('oauth_verifier');
      const denied = url.searchParams.get('denied');

      if (denied) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body><h1>Authorization Denied</h1><p>You can close this window.</p></body></html>',
        );
        cleanup();
        reject(new OAuthFlowError('User denied OAuth authorization'));
        return;
      }

      if (!verifier) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body><h1>Error</h1><p>Missing verifier. Please try again.</p></body></html>',
        );
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        '<html><body><h1>Authorization Successful!</h1><p>You can close this window and return to your application.</p></body></html>',
      );

      cleanup();
      resolve({ verifier });
    });

    refs.server = server;

    server.listen(port, 'localhost', () => {
      log.info(`OAuth: Callback server listening on port ${port}`);
    });

    server.on('error', (err) => {
      cleanup();
      reject(new OAuthFlowError(`Failed to start callback server: ${err.message}`));
    });

    // Set timeout for the callback
    refs.timeout = setTimeout(() => {
      cleanup();
      reject(
        new OAuthFlowError('OAuth callback timeout - authorization took too long (5 minutes)'),
      );
    }, OAUTH_CALLBACK_CONFIG.timeoutMs);
  });
}

/**
 * Executes the full OAuth 1.0a flow interactively
 * 1. Get request token
 * 2. Open browser for user authorization
 * 3. Wait for callback with verifier
 * 4. Exchange for access token
 * 5. Verify identity
 * 6. Cache tokens
 */
export async function performOAuthFlow(): Promise<OAuthTokenCache> {
  // Check for cached tokens first
  const cached = readCachedTokens();
  if (cached) {
    try {
      // Verify cached tokens are still valid
      await verifyIdentity(cached.accessToken, cached.accessTokenSecret);
      log.info(`OAuth: Using cached credentials for user "${cached.username}"`);
      return cached;
    } catch {
      // Cached tokens are invalid, delete and re-authenticate
      log.warn('OAuth: Cached tokens are invalid, re-authenticating...');
      deleteCachedTokens();
    }
  }

  log.info('OAuth: Starting interactive authorization flow...');

  // Get a dynamic port for the callback server
  const port = await getPort({ portRange: [49152, 65535] });
  const callbackUrl = `http://localhost:${port}${OAUTH_CALLBACK_CONFIG.callbackPath}`;

  // Step 1: Get request token
  log.info('OAuth: Requesting temporary credentials...');
  const requestTokens = await getRequestToken(callbackUrl);

  // Build authorization URL
  const authUrl = `${OAUTH_ENDPOINTS.authorize}?oauth_token=${requestTokens.token}`;

  // Start callback server before opening browser
  const serverPromise = createCallbackServer(port);

  // Step 2: Open browser for authorization
  log.info('OAuth: Opening browser for authorization...');
  log.info(`OAuth: If browser doesn't open, visit: ${authUrl}`);
  await openBrowser(authUrl);

  // Wait for callback
  const { verifier } = await serverPromise;

  // Step 3: Exchange for access token
  log.info('OAuth: Exchanging for access token...');
  const accessTokens = await getAccessToken(
    requestTokens.token,
    requestTokens.tokenSecret,
    verifier,
  );

  // Step 4: Verify identity
  log.info('OAuth: Verifying identity...');
  const username = await verifyIdentity(accessTokens.token, accessTokens.tokenSecret);

  // Step 5: Cache tokens
  const tokenCache: OAuthTokenCache = {
    accessToken: accessTokens.token,
    accessTokenSecret: accessTokens.tokenSecret,
    username,
    obtainedAt: Date.now(),
  };

  writeCachedTokens(tokenCache);
  log.info(`OAuth: Successfully authenticated as "${username}"`);

  return tokenCache;
}

/**
 * Verifies existing cached tokens are still valid
 * Returns the cached tokens if valid, null otherwise
 */
export async function verifyCachedTokens(): Promise<OAuthTokenCache | null> {
  const cached = readCachedTokens();
  if (!cached) {
    return null;
  }

  try {
    await verifyIdentity(cached.accessToken, cached.accessTokenSecret);
    return cached;
  } catch {
    deleteCachedTokens();
    return null;
  }
}

/**
 * Invalidates the current OAuth session by deleting cached tokens
 */
export function invalidateOAuthSession(): void {
  deleteCachedTokens();
  log.info('OAuth: Session invalidated, tokens deleted');
}
