import { isDiscogsError } from '../errors.js';
import {
  type Release,
  type ReleaseParams,
  type ReleaseRating,
  type ReleaseRatingEditParams,
  type ReleaseRatingParams,
  ReleaseRatingSchema,
  ReleaseSchema,
} from '../types/release.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs Release-related operations
 */
export class ReleaseService extends DiscogsService {
  constructor() {
    super('/releases');
  }

  /**
   * Deletes the release's rating for a given user
   *
   * @param params - Parameters for the request
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to delete a release rating of another user
   * @throws {DiscogsResourceNotFoundError} If the release or user cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async deleteRatingByUser({ username, release_id }: ReleaseRatingParams): Promise<void> {
    try {
      await this.request<void>(`/${release_id}/rating/${username}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to delete release rating: ${String(error)}`);
    }
  }

  /**
   * Updates the release's rating for a given user
   *
   * @param params - Parameters for the request
   * @returns {ReleaseRating} The updated release rating
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsPermissionError} If trying to edit a release rating of another user
   * @throws {DiscogsResourceNotFoundError} If the release or user cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async editRatingByUser({
    username,
    release_id,
    rating,
  }: ReleaseRatingEditParams): Promise<ReleaseRating> {
    try {
      const response = await this.request<ReleaseRating>(`/${release_id}/rating/${username}`, {
        method: 'PUT',
        body: { rating },
      });

      const validatedResponse = ReleaseRatingSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to edit release rating: ${String(error)}`);
    }
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

  /**
   * Retrieves the release's rating for a given user
   *
   * @param params - Parameters for the request
   * @returns {ReleaseRating} The release rating
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the release or user cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getRatingByUser({ username, release_id }: ReleaseRatingParams): Promise<ReleaseRating> {
    try {
      const response = await this.request<ReleaseRating>(`/${release_id}/rating/${username}`);

      const validatedResponse = ReleaseRatingSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get release rating: ${String(error)}`);
    }
  }
}
