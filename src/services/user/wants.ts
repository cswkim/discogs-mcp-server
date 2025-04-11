import { isDiscogsError } from '../../errors.js';
import {
  type UserWantlist,
  type UserWantlistItem,
  type UserWantlistItemParams,
  UserWantlistItemSchema,
  type UserWantlistParams,
  UserWantlistSchema,
} from '../../types/user/index.js';
import { BaseUserService } from '../index.js';

/**
 * Service for Discogs User Wantlist operations
 */
export class UserWantsService extends BaseUserService {
  /**
   * Returns the list of releases in a user's wantlist
   *
   * @param params - Parameters for the wantlist request including username and optional pagination/sorting
   * @returns {UserWantlist} The user's wantlist with pagination metadata
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to get the private wantlist of another user
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async getList({ username, ...options }: UserWantlistParams): Promise<UserWantlist> {
    try {
      const response = await this.request<UserWantlist>(`/${username}/wants`, {
        params: options,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserWantlistSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get wantlist: ${String(error)}`);
    }
  }

  /**
   * Add a release to a user's wantlist
   *
   * @param params - Parameters for adding a release to wantlist
   * @returns {UserWantlistItem} The added wantlist item
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to add to another user's wantlist
   * @throws {DiscogsResourceNotFoundError} If the username or release_id cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async addItem({
    username,
    release_id,
    ...body
  }: UserWantlistItemParams): Promise<UserWantlistItem> {
    try {
      const response = await this.request<UserWantlistItem>(`/${username}/wants/${release_id}`, {
        method: 'PUT',
        body,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserWantlistItemSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to add to wantlist: ${String(error)}`);
    }
  }

  /**
   * Edit a release in a user's wantlist
   *
   * @param params - Parameters for editing a release in a wantlist
   * @returns {UserWantlistItem} The edited wantlist item
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to edit a release in another user's wantlist
   * @throws {DiscogsResourceNotFoundError} If the username or release_id cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async editItem({
    username,
    release_id,
    ...body
  }: UserWantlistItemParams): Promise<UserWantlistItem> {
    try {
      const response = await this.request<UserWantlistItem>(`/${username}/wants/${release_id}`, {
        method: 'POST',
        body,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserWantlistItemSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to add to wantlist: ${String(error)}`);
    }
  }

  /**
   * Delete a release from a user's wantlist
   *
   * @param params - Parameters for deleting a release from wantlist including username and release_id
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to delete from another user's wantlist
   * @throws {DiscogsResourceNotFoundError} If the username or release_id cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async deleteItem({ username, release_id }: UserWantlistItemParams): Promise<void> {
    try {
      await this.request(`/${username}/wants/${release_id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For other unexpected errors, wrap them
      throw new Error(`Failed to delete from wantlist: ${String(error)}`);
    }
  }
}
