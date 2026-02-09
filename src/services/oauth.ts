import { isDiscogsError } from '../errors.js';
import { DiscogsUserIdentity, DiscogsUserIdentitySchema } from '../types/oauth.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs OAuth-related operations
 */
export class OAuthService extends DiscogsService {
  constructor() {
    super('/oauth');
  }

  /**
   * Get the identity of the authenticated user
   * @returns The user's identity information
   * @throws {DiscogsAuthenticationError} If authentication fails (401)
   */
  async getUserIdentity(): Promise<DiscogsUserIdentity> {
    try {
      // Call the identity endpoint relative to the OAuth base path
      const response = await this.request<DiscogsUserIdentity>('/identity');

      // Validate the response using Zod schema
      const validatedResponse = DiscogsUserIdentitySchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get identity: ${String(error)}`, { cause: error });
    }
  }
}
