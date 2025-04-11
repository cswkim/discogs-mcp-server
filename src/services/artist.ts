import { isDiscogsError } from '../errors.js';
import {
  ArtistReleasesSchema,
  ArtistSchema,
  type Artist,
  type ArtistIdParam,
  type ArtistReleases,
  type ArtistReleasesParams,
} from '../types/artist.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs Artist-related operations
 */
export class ArtistService extends DiscogsService {
  constructor() {
    super('/artists');
  }

  /**
   * Get an artist
   *
   * @param params - Parameters containing the artist ID
   * @returns {Artist} The artist information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the artist cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async get({ artist_id }: ArtistIdParam): Promise<Artist> {
    try {
      const response = await this.request<Artist>(`/${artist_id}`);

      const validatedResponse = ArtistSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get artist: ${String(error)}`);
    }
  }

  /**
   * Get an artist's releases
   *
   * @param params - Parameters containing the artist ID and pagination options
   * @returns {ArtistReleases} The artist releases
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the artist cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getReleases({ artist_id, ...options }: ArtistReleasesParams): Promise<ArtistReleases> {
    try {
      const response = await this.request<ArtistReleases>(`/${artist_id}/releases`, {
        params: options,
      });

      const validatedResponse = ArtistReleasesSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get artist releases: ${String(error)}`);
    }
  }
}
