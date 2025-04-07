import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { UserService } from '../services/user.js';
import { UsernameInputSchema } from '../types/common.js';

/**
 * MCP tool for fetching a Discogs user's collection value
 */
export const getUserCollectionValueTool: Tool<undefined, typeof UsernameInputSchema> = {
  name: 'get_user_collection_value',
  description: `Returns the minimum, median, and maximum value of a user's collection`,
  parameters: UsernameInputSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const collectionValue = await userService.getCollectionValue(args);

      return JSON.stringify(collectionValue);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserCollectionTools(server: FastMCP): void {
  server.addTool(getUserCollectionValueTool);
}
