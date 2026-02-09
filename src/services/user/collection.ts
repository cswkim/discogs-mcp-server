import { isDiscogsError } from '../../errors.js';
import { UsernameInput } from '../../types/common.js';
import {
  type UserCollectionCustomFieldEditParams,
  type UserCollectionCustomFields,
  UserCollectionCustomFieldsSchema,
  type UserCollectionFolder,
  type UserCollectionFolderCreateParams,
  type UserCollectionFolderEditParams,
  type UserCollectionFolderParams,
  type UserCollectionFolderReleaseParams,
  type UserCollectionFolders,
  UserCollectionFolderSchema,
  UserCollectionFoldersSchema,
  type UserCollectionItemsByRelease,
  UserCollectionItemsByReleaseSchema,
  type UserCollectionItemsParams,
  type UserCollectionMoveReleaseParams,
  type UserCollectionReleaseAdded,
  UserCollectionReleaseAddedSchema,
  type UserCollectionReleaseDeletedParams,
  type UserCollectionReleaseParams,
  type UserCollectionReleaseRatingParams,
  type UserCollectionValue,
  UserCollectionValueSchema,
} from '../../types/user/index.js';
import { BaseUserService } from '../index.js';

/**
 * Service for Discogs User Collection operations
 */
export class UserCollectionService extends BaseUserService {
  /**
   * Add a release to a folder in a user's collection. The folder_id must be non-zero.
   *
   * @param params The parameters for the release addition
   * @returns {UserCollectionReleaseAdded} The added release
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to add a release to a folder of another user
   * @throws {DiscogsResourceNotFoundError} If the username, folder_id, or release_id cannot be found
   * @throws {DiscogsValidationFailedError} If the folder_id is 0
   * @throws {Error} If there's an unexpected error
   */
  async addReleaseToFolder({
    username,
    folder_id,
    release_id,
  }: UserCollectionFolderReleaseParams): Promise<UserCollectionReleaseAdded> {
    try {
      const response = await this.request<UserCollectionReleaseAdded>(
        `/${username}/collection/folders/${folder_id}/releases/${release_id}`,
        {
          method: 'POST',
        },
      );

      const validatedResponse = UserCollectionReleaseAddedSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to add release to folder: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Create a new folder in a user's collection
   *
   * @param params The parameters for the folder creation
   * @returns {UserCollectionFolder} The created folder
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to create a folder for another user
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async createFolder({
    username,
    ...body
  }: UserCollectionFolderCreateParams): Promise<UserCollectionFolder> {
    try {
      const response = await this.request<UserCollectionFolder>(`/${username}/collection/folders`, {
        method: 'POST',
        body,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserCollectionFolderSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to create folder: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Delete a folder from a user's collection. A folder must be empty before it can be deleted.
   *
   * @param params The parameters for the folder deletion
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to delete a folder of another user
   * @throws {DiscogsResourceNotFoundError} If the username or folder cannot be found
   * @throws {DiscogsValidationFailedError} If the folder is not empty
   * @throws {Error} If there's an unexpected error
   */
  async deleteFolder({ username, folder_id }: UserCollectionFolderParams): Promise<void> {
    try {
      await this.request<void>(`/${username}/collection/folders/${folder_id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      // For unexpected errors, wrap them
      throw new Error(`Failed to delete folder: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Remove an instance of a release from a user's collection folder
   *
   * @param params The parameters for the release deletion
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to delete a release from a folder of another user
   * @throws {DiscogsResourceNotFoundError} If the username, folder_id, release_id, or instance_id cannot be found
   * @throws {DiscogsValidationFailedError} If the folder_id is 0
   * @throws {Error} If there's an unexpected error
   */
  async deleteReleaseFromFolder({
    username,
    folder_id,
    release_id,
    instance_id,
  }: UserCollectionReleaseDeletedParams): Promise<void> {
    try {
      await this.request<void>(
        `/${username}/collection/folders/${folder_id}/releases/${release_id}/instances/${instance_id}`,
        {
          method: 'DELETE',
        },
      );
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to delete release from folder: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Edit a custom field value for a release in a user's collection
   *
   * @param params The parameters for the custom field value edit
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to edit a custom field value of another user
   * @throws {DiscogsResourceNotFoundError} If the username, folder_id, release_id, or instance_id cannot be found
   * @throws {DiscogsValidationFailedError} If the field is a dropdown and the value is not in the list of options
   * @throws {Error} If there's an unexpected error
   */
  async editCustomFieldValue({
    username,
    folder_id,
    release_id,
    instance_id,
    field_id,
    value,
  }: UserCollectionCustomFieldEditParams): Promise<void> {
    try {
      await this.request<void>(
        `/${username}/collection/folders/${folder_id}/releases/${release_id}/instances/${instance_id}/fields/${field_id}`,
        {
          method: 'POST',
          body: { value },
        },
      );
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to edit custom field value: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Edit a folder's metadata. Folders 0 and 1 cannot be renamed.
   *
   * @param params The parameters for the folder edit
   * @returns {UserCollectionFolder} The edited folder
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to edit a folder of another user
   * @throws {DiscogsResourceNotFoundError} If the username or folder cannot be found
   * @throws {DiscogsValidationFailedError} If the folder_id is 0 or 1
   * @throws {Error} If there's an unexpected error
   */
  async editFolder({
    username,
    folder_id,
    ...body
  }: UserCollectionFolderEditParams): Promise<UserCollectionFolder> {
    try {
      const response = await this.request<UserCollectionFolder>(
        `/${username}/collection/folders/${folder_id}`,
        {
          method: 'POST',
          body,
        },
      );

      // Validate the response using Zod schema
      const validatedResponse = UserCollectionFolderSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      // For unexpected errors, wrap them
      throw new Error(`Failed to edit folder: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Find a release in a user's collection
   *
   * @param params The parameters for the release search
   * @returns {UserCollectionItemsByRelease} The releases in the user's collection
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to search a private collection
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async findRelease({
    username,
    release_id,
    ...options
  }: UserCollectionReleaseParams): Promise<UserCollectionItemsByRelease> {
    try {
      const response = await this.request<UserCollectionItemsByRelease>(
        `/${username}/collection/releases/${release_id}`,
        {
          params: options,
        },
      );

      // Validate the response using Zod schema
      const validatedResponse = UserCollectionItemsByReleaseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      // For unexpected errors, wrap them
      throw new Error(`Failed to find release in collection: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Retrieve a list of user-defined collection notes fields. These fields are available on every release in the collection.
   *
   * @param username The username of whose collection custom fields you are requesting
   * @returns {UserCollectionCustomFields} The user's collection custom fields
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to get custom fields of a private collection
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getCustomFields({ username }: UsernameInput): Promise<UserCollectionCustomFields> {
    try {
      const response = await this.request<UserCollectionCustomFields>(
        `/${username}/collection/fields`,
      );

      const validatedResponse = UserCollectionCustomFieldsSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get collection custom fields: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Retrieve a list of folders in a user's collection
   *
   * @param username The username of whose collection folders you are requesting
   * @returns {UserCollectionFolder[]} The user's collection folders
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If another user's collection does not have public folders
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getFolders({ username }: UsernameInput): Promise<UserCollectionFolders> {
    try {
      const response = await this.request<UserCollectionFolders>(`/${username}/collection/folders`);

      // Validate the response using Zod schema
      const validatedResponse = UserCollectionFoldersSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      // For unexpected errors, wrap them
      throw new Error(`Failed to get collection folders: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Retrieve metadata about a folder in a user's collection
   *
   * @param params The parameters for the folder retrieval
   * @returns {UserCollectionFolder} The retrieved folder
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to get a private folder of another user
   * @throws {DiscogsResourceNotFoundError} If the username or folder cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getFolder({
    username,
    folder_id,
  }: UserCollectionFolderParams): Promise<UserCollectionFolder> {
    try {
      const response = await this.request<UserCollectionFolder>(
        `/${username}/collection/folders/${folder_id}`,
      );

      const validatedResponse = UserCollectionFolderSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get folder: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Returns the list of item in a folder in a user's collection
   *
   * @param params The parameters for the item retrieval
   * @returns {UserCollectionItemsByRelease} The items in the user's collection
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to get a private collection
   * @throws {DiscogsResourceNotFoundError} If the username or folder cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getItems({
    username,
    folder_id,
    ...options
  }: UserCollectionItemsParams): Promise<UserCollectionItemsByRelease> {
    try {
      const response = await this.request<UserCollectionItemsByRelease>(
        `/${username}/collection/folders/${folder_id}/releases`,
        {
          params: options,
        },
      );

      const validatedResponse = UserCollectionItemsByReleaseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get collection items: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Returns the minimum, median, and maximum value of a user's collection
   *
   * @param username The username of whose collection value you are requesting
   * @returns {UserCollectionValue} The user's collection value
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to get the collection value of another user
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getValue({ username }: UsernameInput): Promise<UserCollectionValue> {
    try {
      const response = await this.request<UserCollectionValue>(`/${username}/collection/value`);

      // Validate the response using Zod schema
      const validatedResponse = UserCollectionValueSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For unexpected errors, wrap them
      throw new Error(`Failed to get collection value: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Move a release in a user's collection to another folder
   *
   * @param params The parameters for the release move
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to move a collection release of another user
   * @throws {DiscogsResourceNotFoundError} If the user, source folder, destination folder, release, or instance cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async moveRelease({
    username,
    folder_id,
    release_id,
    instance_id,
    ...body
  }: UserCollectionMoveReleaseParams): Promise<void> {
    try {
      await this.request<void>(
        `/${username}/collection/folders/${folder_id}/releases/${release_id}/instances/${instance_id}`,
        {
          method: 'POST',
          body: { folder_id: body.destination_folder_id },
        },
      );
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to move release: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Rate a release in a user's collection
   *
   * @param params The parameters for the release rating
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to rate a collection release of another user
   * @throws {DiscogsResourceNotFoundError} If the username, folder_id, release_id, or instance_id cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async rateRelease({
    username,
    folder_id,
    release_id,
    instance_id,
    ...body
  }: UserCollectionReleaseRatingParams): Promise<void> {
    try {
      await this.request<void>(
        `/${username}/collection/folders/${folder_id}/releases/${release_id}/instances/${instance_id}`,
        {
          method: 'POST',
          body,
        },
      );
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to rate release: ${String(error)}`, { cause: error });
    }
  }
}
