import dotenv from 'dotenv';
import { VERSION } from './version.js';

// Load environment variables from .env file
dotenv.config();

// Discogs API configuration
export const config = {
  discogs: {
    apiUrl: process.env.DISCOGS_API_URL,
    /* Some MCP clients can't handle large amounts of data.
     * The client may explicitly request more at their own peril. */
    defaultPerPage: 5,
    mediaType: process.env.DISCOGS_MEDIA_TYPE,
    personalAccessToken: process.env.DISCOGS_PERSONAL_ACCESS_TOKEN,
    userAgent:
      process.env.DISCOGS_USER_AGENT_APP_NAME && process.env.DISCOGS_USER_AGENT_URL
        ? `${process.env.DISCOGS_USER_AGENT_APP_NAME}/${VERSION} +${process.env.DISCOGS_USER_AGENT_URL}`
        : undefined,
  },
  server: {
    name: process.env.SERVER_NAME || 'MCP Server',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  },
};

// Validate required configuration
export function validateConfig(): void {
  const missingVars: string[] = [];

  if (!config.discogs.apiUrl) {
    missingVars.push('DISCOGS_API_URL');
  }

  if (!config.discogs.mediaType) {
    missingVars.push('DISCOGS_MEDIA_TYPE');
  }

  if (!config.discogs.personalAccessToken) {
    missingVars.push('DISCOGS_PERSONAL_ACCESS_TOKEN');
  }

  if (!config.discogs.userAgent) {
    missingVars.push('DISCOGS_USER_AGENT_APP_NAME and/or DISCOGS_USER_AGENT_URL');
  }

  if (config.server.port === undefined) {
    missingVars.push('PORT');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
