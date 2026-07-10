import dotenv from 'dotenv';
import type { LoggingLevel } from 'fastmcp';
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
  },
  server: {
    name: process.env.SERVER_NAME || 'Discogs MCP Server',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    host: process.env.SERVER_HOST || '0.0.0.0',
    ping: {
      // Enable ping for HTTP stream transport to prevent SSE timeouts
      // Default interval is 30 seconds (well under typical 60s timeout)
      enabled: process.env.PING_ENABLED !== 'false',
      intervalMs: process.env.PING_INTERVAL_MS ? parseInt(process.env.PING_INTERVAL_MS, 10) : 30000,
      logLevel: (process.env.PING_LOG_LEVEL as LoggingLevel | undefined) || 'debug',
    },
  },
};

// Validate required configuration
export function validateConfig(): void {
  const missingVars: string[] = [];

  if (!process.env.DISCOGS_PERSONAL_ACCESS_TOKEN) {
    missingVars.push('DISCOGS_PERSONAL_ACCESS_TOKEN');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
