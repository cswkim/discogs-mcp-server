import { isDiscogsError } from '../errors.js';
import {
  MasterReleaseSchema,
  MasterReleaseVersionsResponseSchema,
  type MasterRelease,
  type MasterReleaseIdParam,
  type MasterReleaseVersionsParam,
  type MasterReleaseVersionsResponse,
} from '../types/master.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs Master Release-related operations
 */
export class MasterReleaseService extends DiscogsService {
  constructor() {
    super('/masters');
  }

  /**
   * Get a master release
   *
   * @param params - Parameters containing the master release ID
   * @returns {MasterRelease} The master release information
   * @throws {DiscogsResourceNotFoundError} If the master release cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async get({ master_id }: MasterReleaseIdParam): Promise<MasterRelease> {
    try {
      const response = await this.request<MasterRelease>(`/${master_id}`);

      const validatedResponse = MasterReleaseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get master release: ${String(error)}`);
    }
  }

  /**
   * Retrieves a list of all Releases that are versions of this master
   *
   * @param params - Parameters containing the master release ID and optional query parameters
   * @returns {MasterReleaseVersionsResponse} The master release versions information
   * @throws {DiscogsResourceNotFoundError} If the master release versions cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getVersions({
    master_id,
    ...options
  }: MasterReleaseVersionsParam): Promise<MasterReleaseVersionsResponse> {
    try {
      const response = await this.request<MasterReleaseVersionsResponse>(`/${master_id}/versions`, {
        params: options,
      });

      const validatedResponse = MasterReleaseVersionsResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get master release versions: ${String(error)}`);
    }
  }
}
