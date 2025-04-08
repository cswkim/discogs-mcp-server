import { isDiscogsError } from '../errors.js';
import {
  type UserCollectionValue,
  UserCollectionValueSchema,
  type UserLists,
  type UserListsParams,
  UserListsSchema,
  type UsernameInput,
  type UserProfile,
  type UserProfileEditInput,
  UserProfileSchema,
  type UserWantlist,
  type UserWantlistItem,
  type UserWantlistItemParams,
  UserWantlistItemSchema,
  type UserWantlistParams,
  UserWantlistSchema,
} from '../types/user.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs User-related operations
 */
export class UserService extends DiscogsService {
  constructor() {
    super('/users');
  }

  /**
   * Retrieve a user by username
   *
   * @param username The username of whose profile you are requesting
   * @returns {UserProfile} The user's profile information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async getProfile({ username }: UsernameInput): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>(`/${username}`);

      // Validate the response using Zod schema
      const validatedResponse = UserProfileSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get profile: ${String(error)}`);
    }
  }

  /**
   * Edit a user's profile data
   *
   * @param params UserProfileEditInput
   * @returns {UserProfile} The user's profile information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to edit a profile that is not the authenticated user
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async editProfile(params: UserProfileEditInput): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>(`/${params.username}`, {
        method: 'POST',
        body: params,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserProfileSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to edit profile: ${String(error)}`);
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
  async getCollectionValue({ username }: UsernameInput): Promise<UserCollectionValue> {
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
  async getWantlist(params: UserWantlistParams): Promise<UserWantlist> {
    try {
      const response = await this.request<UserWantlist>(`/${params.username}/wants`, {
        params,
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
  async addToWantlist(params: UserWantlistItemParams): Promise<UserWantlistItem> {
    try {
      const response = await this.request<UserWantlistItem>(
        `/${params.username}/wants/${params.release_id}`,
        {
          method: 'PUT',
          body: params,
        },
      );

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
  async editItemInWantlist(params: UserWantlistItemParams): Promise<UserWantlistItem> {
    try {
      const response = await this.request<UserWantlistItem>(
        `/${params.username}/wants/${params.release_id}`,
        {
          method: 'POST',
          body: params,
        },
      );

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
  async deleteItemInWantlist(params: UserWantlistItemParams): Promise<void> {
    try {
      await this.request(`/${params.username}/wants/${params.release_id}`, {
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

  /**
   * Get a user's lists
   * @param params - Parameters for the request including username and optional pagination/sorting
   * @returns {UserLists} A paginated response containing the user's lists
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async getLists(params: UserListsParams): Promise<UserLists> {
    try {
      const response = await this.request<UserLists>(`/${params.username}/lists`, {
        params,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserListsSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get lists: ${String(error)}`);
    }
  }
}
