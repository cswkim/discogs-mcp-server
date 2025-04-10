import { isDiscogsError } from '../errors.js';
import {
  type Label,
  type LabelIdParam,
  type LabelReleases,
  type LabelReleasesParams,
  LabelReleasesSchema,
  LabelSchema,
} from '../types/label.js';
import { DiscogsService } from './index.js';

export class LabelService extends DiscogsService {
  constructor() {
    super('/labels');
  }

  /**
   * Get a label
   *
   * @param params - Parameters containing the label ID
   * @returns {Label} The label information
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the label cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async get({ label_id }: LabelIdParam): Promise<Label> {
    try {
      const response = await this.request<Label>(`/${label_id}`);

      const validatedResponse = LabelSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get label: ${String(error)}`);
    }
  }

  /**
   * Returns a list of Releases associated with the label
   *
   * @param params - Parameters containing the label ID and pagination options
   * @returns {LabelReleases} The label releases
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the label cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getReleases({ label_id, ...params }: LabelReleasesParams): Promise<LabelReleases> {
    try {
      const response = await this.request<LabelReleases>(`/${label_id}/releases`, {
        params,
      });

      const validatedResponse = LabelReleasesSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get label releases: ${String(error)}`);
    }
  }
}
