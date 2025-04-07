import { isDiscogsError } from '../errors.js';
import {
  UserProfile,
  UserProfileEditInput,
  UserProfileInput,
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
   * @returns The user's profile information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async getProfile({ username }: UserProfileInput): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>(`/${username}`);

      // Validate the response using Zod schema
      const validatedProfile = UserProfileSchema.parse(response);
      return validatedProfile;
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
   * Edit a user’s profile data
   *
   * @param params UserProfileEditInput
   * @returns The updated user profile information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to edit a profile that is not the authenticated user
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async editProfile(params: UserProfileEditInput): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>(`/${params.username}`, {
        method: 'POST',
        body: params,
      });

      // Validate the response using Zod schema
      const validatedProfile = UserProfileSchema.parse(response);
      return validatedProfile;
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
