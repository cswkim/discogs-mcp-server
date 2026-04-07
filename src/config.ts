import dotenv from 'dotenv';
import { VERSION } from './version.js';

// Load environment variables from .env file
dotenv.config();

// Discogs API configuration
export const config = {
  discogs: {
    apiUrl: process.env.DISCOGS_API_URL || 'https://api.discogs.com',
    /* Some MCP clients can't handle large amounts of data.
     * The client may explicitly request more at their own peril. */
    defaultPerPage: 5,
    mediaType: process.env.DISCOGS_MEDIA_TYPE || 'application/vnd.discogs.v2.discogs+json',
    personalAccessToken: process.env.DISCOGS_PERSONAL_ACCESS_TOKEN,
    userAgent: process.env.DISCOGS_USER_AGENT || `DiscogsMCPServer/${VERSION}`,
    authMode: (process.env.DISCOGS_AUTH_MODE?.toLowerCase() || 'auto') as
      | 'token'
      | 'oauth'
      | 'auto',
  },
  server: {
    name: process.env.SERVER_NAME || 'Discogs MCP Server',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    host: process.env.SERVER_HOST || '0.0.0.0',
  },
};

/**
 * Validates configuration at startup
 * Ensures required values are present based on auth mode
 */
export function validateConfig(): void {
  const { authMode, personalAccessToken } = config.discogs;

  // Validate auth mode value
  if (!['token', 'oauth', 'auto'].includes(authMode)) {
    throw new Error(
      `Invalid DISCOGS_AUTH_MODE: "${authMode}". Allowed values: 'token', 'oauth', 'auto'`,
    );
  }

  // If token mode is explicitly set, require the token
  if (authMode === 'token' && !personalAccessToken) {
    throw new Error(
      'DISCOGS_AUTH_MODE is set to "token" but DISCOGS_PERSONAL_ACCESS_TOKEN is not set',
    );
  }
}
