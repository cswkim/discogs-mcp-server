import type { FastMCP, Tool, ToolParameters } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { OAuthService } from '../services/oauth.js';
import { UserService } from '../services/user.js';
import { UserProfileInputSchema } from '../types/user.js';

/**
 * MCP tool for fetching the identity of the authenticated Discogs user
 */
const getUserIdentityTool: Tool<undefined, ToolParameters> = {
  name: 'get_user_identity',
  description: 'Retrieve basic information about the authenticated user',
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

/**
 * MCP tool for fetching a Discogs user's profile
 */
export const getUserProfileTool: Tool<undefined, typeof UserProfileInputSchema> = {
  name: 'get_user_profile',
  description: 'Retrieve a user by username',
  parameters: UserProfileInputSchema,
  execute: async ({ username }) => {
    try {
      const userService = new UserService();
      const profile = await userService.getProfile({ username });

      return JSON.stringify(profile);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserIdentityTools(server: FastMCP): void {
  server.addTool(getUserIdentityTool);
  server.addTool(getUserProfileTool);
}
