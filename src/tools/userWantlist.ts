import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { UserService } from '../services/user.js';
import { UserWantlistParamsSchema } from '../types/user.js';

/**
 * MCP tool for fetching a Discogs user's wantlist
 */
export const getUserWantlistTool: Tool<undefined, typeof UserWantlistParamsSchema> = {
  name: 'get_user_wantlist',
  description: `Returns the list of releases in a user's wantlist`,
  parameters: UserWantlistParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const wantlist = await userService.getWantlist(args);

      return JSON.stringify(wantlist);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserWantlistTools(server: FastMCP): void {
  server.addTool(getUserWantlistTool);
}
