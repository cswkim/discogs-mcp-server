import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { UserService } from '../services/user/index.js';
import { UsernameInputSchema } from '../types/common.js';
import {
  UserCollectionFolderCreateParamsSchema,
  UserCollectionFolderParamsSchema,
} from '../types/user/index.js';

/**
 * MCP tool for creating a folder in a Discogs user's collection
 */
export const createUserCollectionFolderTool: Tool<
  undefined,
  typeof UserCollectionFolderCreateParamsSchema
> = {
  name: 'create_user_collection_folder',
  description: `Create a folder in a user's collection`,
  parameters: UserCollectionFolderCreateParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const folder = await userService.collection.createFolder(args);

      return JSON.stringify(folder);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for deleting a folder in a Discogs user's collection
 */
export const deleteUserCollectionFolderTool: Tool<
  undefined,
  typeof UserCollectionFolderParamsSchema
> = {
  name: 'delete_user_collection_folder',
  description: `Delete a folder from a user's collection. A folder must be empty before it can be deleted.`,
  parameters: UserCollectionFolderParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      await userService.collection.deleteFolder(args);

      return 'Folder deleted successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for editing a folder in a Discogs user's collection
 */
export const editUserCollectionFolderTool: Tool<
  undefined,
  typeof UserCollectionFolderParamsSchema
> = {
  name: 'edit_user_collection_folder',
  description: `Edit a folder's metadata. Folders 0 and 1 cannot be renamed.`,
  parameters: UserCollectionFolderParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const folder = await userService.collection.editFolder(args);

      return JSON.stringify(folder);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs user's collection folder
 */
export const getUserCollectionFolderTool: Tool<undefined, typeof UserCollectionFolderParamsSchema> =
  {
    name: 'get_user_collection_folder',
    description: `Retrieve metadata about a folder in a user's collection`,
    parameters: UserCollectionFolderParamsSchema,
    execute: async (args) => {
      try {
        const userService = new UserService();
        const folder = await userService.collection.getFolder(args);

        return JSON.stringify(folder);
      } catch (error) {
        throw formatDiscogsError(error);
      }
    },
  };

/**
 * MCP tool for fetching a Discogs user's collection folders
 */
export const getUserCollectionFoldersTool: Tool<undefined, typeof UsernameInputSchema> = {
  name: 'get_user_collection_folders',
  description: `Retrieve a list of folders in a user's collection`,
  parameters: UsernameInputSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const collectionFolders = await userService.collection.getFolders(args);

      return JSON.stringify(collectionFolders);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

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
      const collectionValue = await userService.collection.getValue(args);

      return JSON.stringify(collectionValue);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserCollectionTools(server: FastMCP): void {
  server.addTool(createUserCollectionFolderTool);
  server.addTool(deleteUserCollectionFolderTool);
  server.addTool(editUserCollectionFolderTool);
  server.addTool(getUserCollectionFolderTool);
  server.addTool(getUserCollectionFoldersTool);
  server.addTool(getUserCollectionValueTool);
}
