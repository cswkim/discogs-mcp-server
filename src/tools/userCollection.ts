import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { UserService } from '../services/user/index.js';
import { UsernameInputSchema } from '../types/common.js';
import {
  UserCollectionFolderCreateParamsSchema,
  UserCollectionFolderEditParamsSchema,
  UserCollectionFolderParamsSchema,
  UserCollectionFolderReleaseParamsSchema,
  UserCollectionItemsParamsSchema,
  UserCollectionMoveReleaseParamsSchema,
  UserCollectionReleaseDeletedParamsSchema,
  UserCollectionReleaseParamsSchema,
  UserCollectionReleaseRatingParamsSchema,
} from '../types/user/index.js';

/**
 * MCP tool for adding a release to a folder in a Discogs user's collection
 */
const addReleaseToUserCollectionFolderTool: Tool<
  undefined,
  typeof UserCollectionFolderReleaseParamsSchema
> = {
  name: 'add_release_to_user_collection_folder',
  description: `Add a release to a folder in a user's collection. The folder_id must be non-zero.`,
  parameters: UserCollectionFolderReleaseParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const release = await userService.collection.addReleaseToFolder(args);

      return JSON.stringify(release);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for creating a folder in a Discogs user's collection
 */
const createUserCollectionFolderTool: Tool<
  undefined,
  typeof UserCollectionFolderCreateParamsSchema
> = {
  name: 'create_user_collection_folder',
  description: `Create a new folder in a user's collection`,
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
 * MCP tool for deleting a release from a folder in a Discogs user's collection
 */
const deleteReleaseFromUserCollectionFolderTool: Tool<
  undefined,
  typeof UserCollectionReleaseDeletedParamsSchema
> = {
  name: 'delete_release_from_user_collection_folder',
  description: `Remove an instance of a release from a user's collection folder. The folder_id must be non-zero.`,
  parameters: UserCollectionReleaseDeletedParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      await userService.collection.deleteReleaseFromFolder(args);

      return 'Release deleted successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for deleting a folder in a Discogs user's collection
 */
const deleteUserCollectionFolderTool: Tool<undefined, typeof UserCollectionFolderParamsSchema> = {
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
const editUserCollectionFolderTool: Tool<undefined, typeof UserCollectionFolderEditParamsSchema> = {
  name: 'edit_user_collection_folder',
  description: `Edit a folder's metadata. Folders 0 and 1 cannot be renamed.`,
  parameters: UserCollectionFolderEditParamsSchema,
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
 * MCP tool for finding a release in a Discogs user's collection
 */
const findReleaseInUserCollectionTool: Tool<undefined, typeof UserCollectionReleaseParamsSchema> = {
  name: 'find_release_in_user_collection',
  description: `Find a release in a user's collection`,
  parameters: UserCollectionReleaseParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const releases = await userService.collection.findRelease(args);

      return JSON.stringify(releases);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs user's collection custom fields
 */
const getUserCollectionCustomFieldsTool: Tool<undefined, typeof UsernameInputSchema> = {
  name: 'get_user_collection_custom_fields',
  description: `Retrieve a list of user-defined collection notes fields. These fields are available on every release in the collection.`,
  parameters: UsernameInputSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const customFields = await userService.collection.getCustomFields(args);

      return JSON.stringify(customFields);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs user's collection folder
 */
const getUserCollectionFolderTool: Tool<undefined, typeof UserCollectionFolderParamsSchema> = {
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
const getUserCollectionFoldersTool: Tool<undefined, typeof UsernameInputSchema> = {
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
 * MCP tool for fetching a Discogs user's collection items
 */
const getUserCollectionItemsTool: Tool<undefined, typeof UserCollectionItemsParamsSchema> = {
  name: 'get_user_collection_items',
  description: `Retrieve a list of items in a user's collection`,
  parameters: UserCollectionItemsParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const items = await userService.collection.getItems(args);

      return JSON.stringify(items);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs user's collection value
 */
const getUserCollectionValueTool: Tool<undefined, typeof UsernameInputSchema> = {
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

/**
 * MCP tool for moving a release in a Discogs user's collection to another folder
 */
const moveReleaseInUserCollectionTool: Tool<
  undefined,
  typeof UserCollectionMoveReleaseParamsSchema
> = {
  name: 'move_release_in_user_collection',
  description: `Move a release in a user's collection to another folder`,
  parameters: UserCollectionMoveReleaseParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      await userService.collection.moveRelease(args);

      return 'Release moved successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for rating a release in a Discogs user's collection
 */
const rateReleaseInUserCollectionTool: Tool<
  undefined,
  typeof UserCollectionReleaseRatingParamsSchema
> = {
  name: 'rate_release_in_user_collection',
  description: `Rate a release in a user's collection. The folder_id must be non-zero.`,
  parameters: UserCollectionReleaseRatingParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      await userService.collection.rateRelease(args);

      return 'Release rated successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserCollectionTools(server: FastMCP): void {
  server.addTool(getUserCollectionFoldersTool);
  server.addTool(createUserCollectionFolderTool);
  server.addTool(getUserCollectionFolderTool);
  server.addTool(editUserCollectionFolderTool);
  server.addTool(deleteUserCollectionFolderTool);
  server.addTool(findReleaseInUserCollectionTool);
  server.addTool(getUserCollectionItemsTool);
  server.addTool(addReleaseToUserCollectionFolderTool);
  server.addTool(rateReleaseInUserCollectionTool);
  server.addTool(moveReleaseInUserCollectionTool);
  server.addTool(deleteReleaseFromUserCollectionFolderTool);
  server.addTool(getUserCollectionCustomFieldsTool);
  server.addTool(getUserCollectionValueTool);
}
