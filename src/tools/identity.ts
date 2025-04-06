import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { OAuthService } from '../services/oauth.js';

/**
 * MCP tool for fetching the identity of the authenticated Discogs user
 * Uses the OAuth service to call the /oauth/identity endpoint
 */
export const getIdentityTool = {
  name: 'get_identity',
  description: 'Get the identity of the currently authenticated Discogs user',
  // No input parameters needed for this simple identity call
  parameters: z.object({}),
  execute: async () => {
    try {
      const oauthService = new OAuthService();
      const identity = await oauthService.getIdentity();

      return JSON.stringify(identity);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};
