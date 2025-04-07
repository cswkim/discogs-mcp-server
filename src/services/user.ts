import { isDiscogsError } from '../errors.js';
import type { UsernameInput } from '../types/common.js';
import {
  type UserCollectionValue,
  UserCollectionValueSchema,
  type UserProfile,
  type UserProfileEditInput,
  UserProfileSchema,
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
}
