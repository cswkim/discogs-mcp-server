import { isDiscogsError } from '../../errors.js';
import { UsernameInput } from '../../types/common.js';
import {
  type UserCollectionFolders,
  type UserCollectionValue,
  UserCollectionFoldersSchema,
  UserCollectionValueSchema,
} from '../../types/user/index.js';
import { BaseUserService } from '../index.js';

/**
 * Service for Discogs User Collection operations
 */
export class UserCollectionService extends BaseUserService {
  /**
   * Retrieve a list of folders in a user's collection
   *
   * @param username The username of whose collection folders you are requesting
   * @returns {UserCollectionFolder[]} The user's collection folders
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If another user's collection does not have public folders
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
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

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get collection folders: ${String(error)}`);
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
   * @throws {Error} If there's a validation error or other unexpected error
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

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get collection value: ${String(error)}`);
    }
  }
}
