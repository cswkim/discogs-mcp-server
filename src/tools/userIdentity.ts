import type { FastMCP, Tool, ToolParameters } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { OAuthService } from '../services/oauth.js';

/**
 * MCP tool for fetching the identity of the authenticated Discogs user
 * Uses the OAuth service to call the /oauth/identity endpoint
 */
const getIdentityTool: Tool<undefined, ToolParameters> = {
  name: 'get_user_identity',
  description: 'Get the identity of the currently authenticated Discogs user',
  parameters: z.object({}),
  execute: async () => {
    try {
      const oauthService = new OAuthService();
      const identity = await oauthService.getUserIdentity();

      return JSON.stringify(identity);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserIdentityTools(server: FastMCP): void {
  server.addTool(getIdentityTool);
}
