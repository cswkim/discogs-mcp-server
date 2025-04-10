import { isDiscogsError } from '../errors.js';
import { type Release, type ReleaseParams, ReleaseSchema } from '../types/release.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs Release-related operations
 */
export class ReleaseService extends DiscogsService {
  constructor() {
    super('/releases');
  }

  /**
   * Get a release
   *
   * @param params - Parameters for the request
   * @returns {Release} The release information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the release cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async get(params: ReleaseParams): Promise<Release> {
    try {
      const { release_id, ...options } = params;
      const response = await this.request<Release>(`/${release_id}`, {
        params: options,
      });

      const validatedResponse = ReleaseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get release: ${String(error)}`);
    }
  }
}
