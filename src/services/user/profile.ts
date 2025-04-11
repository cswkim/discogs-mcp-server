import { isDiscogsError } from '../../errors.js';
import { UsernameInput } from '../../types/common.js';
import {
  type UserProfile,
  type UserProfileEditInput,
  UserProfileSchema,
} from '../../types/user/index.js';
import { BaseUserService } from '../index.js';

/**
 * Service for Discogs User Profile operations
 */
export class UserProfileService extends BaseUserService {
  /**
   * Retrieve a user by username
   *
   * @param username The username of whose profile you are requesting
   * @returns {UserProfile} The user's profile information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async get({ username }: UsernameInput): Promise<UserProfile> {
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
  async edit({ username, ...body }: UserProfileEditInput): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>(`/${username}`, {
        method: 'POST',
        body,
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
}
