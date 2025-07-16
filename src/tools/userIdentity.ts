import type { FastMCP, Tool, ToolParameters } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { OAuthService } from '../services/oauth.js';
import { UserContributionsService, UserSubmissionsService } from '../services/user/contribution.js';
import { UserService } from '../services/user/index.js';
import { FastMCPSessionAuth, UsernameInputSchema } from '../types/common.js';
import { ContributionsParamsSchema } from '../types/user/contribution.js';
import { UserProfileEditInputSchema } from '../types/user/index.js';

/**
 * MCP tool for fetching the identity of the authenticated Discogs user
 */
export const getUserIdentityTool: Tool<FastMCPSessionAuth, ToolParameters> = {
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
export const getUserProfileTool: Tool<FastMCPSessionAuth, typeof UsernameInputSchema> = {
  name: 'get_user_profile',
  description: 'Retrieve a user by username',
  parameters: UsernameInputSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const profile = await userService.profile.get(args);

      return JSON.stringify(profile);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs user's submissions
 */
export const getUserSubmissionsTool: Tool<FastMCPSessionAuth, typeof UsernameInputSchema> = {
  name: 'get_user_submissions',
  description: `Retrieve a user's submissions by username`,
  parameters: UsernameInputSchema,
  execute: async (args) => {
    try {
      const userSubmissionsService = new UserSubmissionsService();
      const submissions = await userSubmissionsService.get(args);

      return JSON.stringify(submissions);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs user's contributions
 */
export const getUserContributionsTool: Tool<FastMCPSessionAuth, typeof ContributionsParamsSchema> =
  {
    name: 'get_user_contributions',
    description: `Retrieve a user's contributions by username`,
    parameters: ContributionsParamsSchema,
    execute: async (args) => {
      try {
        const userContributionsService = new UserContributionsService();
        const contributions = await userContributionsService.get(args);

        return JSON.stringify(contributions);
      } catch (error) {
        throw formatDiscogsError(error);
      }
    },
  };

/**
 * MCP tool for editing a Discogs user's profile
 */
export const editUserProfileTool: Tool<FastMCPSessionAuth, typeof UserProfileEditInputSchema> = {
  name: 'edit_user_profile',
  description: `Edit a user's profile data`,
  parameters: UserProfileEditInputSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const profile = await userService.profile.edit(args);

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
  server.addTool(getUserSubmissionsTool);
  server.addTool(getUserContributionsTool);
}
