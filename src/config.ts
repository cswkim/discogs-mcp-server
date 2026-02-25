import dotenv from 'dotenv';
import { VERSION } from './version.js';

// Load environment variables from .env file
dotenv.config();

// Allowed hostnames for the Discogs API to prevent token exfiltration
const ALLOWED_API_HOSTS = ['api.discogs.com'];

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
  },
  server: {
    name: process.env.SERVER_NAME || 'Discogs MCP Server',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    host: process.env.SERVER_HOST || '127.0.0.1',
    readOnly: process.env.READONLY_MODE === 'true',
    streamApiKey: process.env.STREAM_API_KEY,
  },
};

/**
 * Validates that DISCOGS_API_URL uses HTTPS and points to an allowed host.
 * Prevents token exfiltration via env poisoning.
 */
function validateApiUrl(apiUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(apiUrl);
  } catch {
    throw new Error(`DISCOGS_API_URL is not a valid URL: ${apiUrl}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `DISCOGS_API_URL must use HTTPS. Got: ${parsed.protocol}. ` + `Current value: ${apiUrl}`,
    );
  }

  if (!ALLOWED_API_HOSTS.includes(parsed.hostname)) {
    throw new Error(
      `DISCOGS_API_URL hostname "${parsed.hostname}" is not in the allowed list: ` +
        `${ALLOWED_API_HOSTS.join(', ')}. ` +
        `This prevents accidental token exfiltration to untrusted hosts.`,
    );
  }
}

// Validate required configuration
export function validateConfig(): void {
  const missingVars: string[] = [];

  if (!process.env.DISCOGS_PERSONAL_ACCESS_TOKEN) {
    missingVars.push('DISCOGS_PERSONAL_ACCESS_TOKEN');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  validateApiUrl(config.discogs.apiUrl);
}
