import { DiscogsAuthenticationError } from '../errors.js';
import { DiscogsIdentity, DiscogsIdentitySchema } from '../types/oauth.js';
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
  async getIdentity(): Promise<DiscogsIdentity> {
    try {
      // Call the identity endpoint relative to the OAuth base path
      const response = await this.request<DiscogsIdentity>('/identity');

      // Validate the response using Zod schema
      const validatedResponse = DiscogsIdentitySchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error (including 401), just rethrow it
      if (error instanceof DiscogsAuthenticationError) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get identity: ${String(error)}`);
    }
  }
}
