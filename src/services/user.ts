import { isDiscogsError } from '../errors.js';
import { UserProfile, UserProfileInput, UserProfileSchema } from '../types/user.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs User-related operations
 */
export class UserService extends DiscogsService {
  constructor() {
    super('/users');
  }

  /**
   * Get a user's profile by username
   *
   * @param username The Discogs username to fetch
   * @returns The user's profile information
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
}
