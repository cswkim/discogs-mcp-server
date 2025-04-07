import type { FastMCP, Tool, ToolParameters } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { OAuthService } from '../services/oauth.js';
import { UserService } from '../services/user.js';
import { UserProfileEditInputSchema, UserProfileInputSchema } from '../types/user.js';

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
  execute: async (args) => {
    try {
      const userService = new UserService();
      const profile = await userService.getProfile(args);

      return JSON.stringify(profile);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for editing a Discogs user's profile
 */
export const editUserProfileTool: Tool<undefined, typeof UserProfileEditInputSchema> = {
  name: 'edit_user_profile',
  description: `Edit a user's profile data`,
  parameters: UserProfileEditInputSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const profile = await userService.editProfile(args);

      return JSON.stringify(profile);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserIdentityTools(server: FastMCP): void {
  server.addTool(getUserIdentityTool);
  server.addTool(getUserProfileTool);
  server.addTool(editUserProfileTool);
}
