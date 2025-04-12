import { isDiscogsError } from '../errors.js';
import {
  MasterReleaseSchema,
  type MasterRelease,
  type MasterReleaseIdParam,
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
}
