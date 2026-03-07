import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { UserService } from '../services/user/index.js';
import { FastMCPSessionAuth } from '../types/common.js';
import { UserWantlistItemParamsSchema, UserWantlistParamsSchema } from '../types/user/index.js';

/**
 * MCP tool for fetching a Discogs user's wantlist
 */
export const getUserWantlistTool: Tool<FastMCPSessionAuth, typeof UserWantlistParamsSchema> = {
  name: 'get_user_wantlist',
  description: `Returns the list of releases in a user's wantlist`,
  parameters: UserWantlistParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const wantlist = await userService.wants.getList(args);

      return JSON.stringify(wantlist);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for adding a release to a user's wantlist
 */
export const addToWantlistTool: Tool<FastMCPSessionAuth, typeof UserWantlistItemParamsSchema> = {
  name: 'add_to_wantlist',
  description: `Add a release to a user's wantlist`,
  parameters: UserWantlistItemParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const wantlistItem = await userService.wants.addItem(args);

      return JSON.stringify(wantlistItem);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for editing a release in a user's wantlist
 */
export const editItemInWantlistTool: Tool<FastMCPSessionAuth, typeof UserWantlistItemParamsSchema> =
  {
    name: 'edit_item_in_wantlist',
    description: `Edit a release in a user's wantlist`,
    parameters: UserWantlistItemParamsSchema,
    execute: async (args) => {
      try {
        const userService = new UserService();
        const wantlistItem = await userService.wants.editItem(args);

        return JSON.stringify(wantlistItem);
      } catch (error) {
        throw formatDiscogsError(error);
      }
    },
  };

/**
 * MCP tool for deleting a release from a user's wantlist
 */
export const deleteItemInWantlistTool: Tool<
  FastMCPSessionAuth,
  typeof UserWantlistItemParamsSchema
> = {
  name: 'delete_item_in_wantlist',
  description: `Delete a release from a user's wantlist`,
  parameters: UserWantlistItemParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      await userService.wants.deleteItem(args);

      return 'Release deleted from wantlist';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserWantlistTools(server: FastMCP, options?: { readOnly?: boolean }): void {
  server.addTool(getUserWantlistTool);

  if (!options?.readOnly) {
    server.addTool(addToWantlistTool);
    server.addTool(editItemInWantlistTool);
    server.addTool(deleteItemInWantlistTool);
  }
}
