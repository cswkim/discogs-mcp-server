import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Discogs API configuration
export const config = {
  discogs: {
    personalAccessToken: process.env.DISCOGS_PERSONAL_ACCESS_TOKEN,
    userAgent: process.env.DISCOGS_USER_AGENT,
    apiUrl: process.env.DISCOGS_API_URL,
  },
  server: {
    name: process.env.SERVER_NAME || 'MCP Server',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  },
};

// Validate required configuration
export function validateConfig(): void {
  const missingVars: string[] = [];

  if (!config.discogs.personalAccessToken) {
    missingVars.push('DISCOGS_PERSONAL_ACCESS_TOKEN');
  }

  if (!config.discogs.userAgent) {
    missingVars.push('DISCOGS_USER_AGENT');
  }

  if (!config.discogs.apiUrl) {
    missingVars.push('DISCOGS_API_URL');
  }

  if (config.server.port === undefined) {
    missingVars.push('PORT');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
