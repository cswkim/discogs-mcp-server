import { isDiscogsError } from '../errors.js';
import { DiscogsService } from './index.js';

export class InventoryService extends DiscogsService {
  constructor() {
    super('/inventory');
  }

  /**
   * Request an export of your inventory as a CSV
   *
   * @returns {void}
   * @throws {DiscogsAuthenticationError} If the request is not authenticated
   * @throws {Error} If there's an unexpected error
   */
  async export(): Promise<void> {
    try {
      await this.request<void>('/export', {
        method: 'POST',
      });
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }
      throw new Error(`Failed to export inventory: ${String(error)}`);
    }
  }
}
