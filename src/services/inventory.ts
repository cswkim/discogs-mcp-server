import { isDiscogsError } from '../errors.js';
import {
  type InventoryExportItem,
  InventoryExportItemSchema,
  type InventoryExportsResponse,
  InventoryExportsResponseSchema,
  type InventoryIdParam,
} from '../types/inventory.js';
import { DiscogsService } from './index.js';

export class InventoryService extends DiscogsService {
  constructor() {
    super('/inventory');
  }

  /**
   * Download an inventory export as a CSV
   *
   * @param {InventoryIdParam} params - The parameters for the request
   * @returns {string} The inventory export as a CSV
   * @throws {DiscogsAuthenticationError} If the request is not authenticated
   * @throws {DiscogsResourceNotFoundError} If the inventory export does not exist
   * @throws {Error} If there's an unexpected error
   */
  async downloadExport({ id }: InventoryIdParam): Promise<string> {
    try {
      const response = await this.request<string>(`/export/${id}/download`);
      return response;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }
      throw new Error(`Failed to download inventory export: ${String(error)}`, { cause: error });
    }
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
      throw new Error(`Failed to export inventory: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Get details about an inventory export
   *
   * @param {InventoryIdParam} params - The parameters for the request
   * @returns {InventoryExportItem} The inventory export item
   * @throws {DiscogsAuthenticationError} If the request is not authenticated
   * @throws {DiscogsResourceNotFoundError} If the inventory export does not exist
   * @throws {Error} If there's an unexpected error
   */
  async getExport({ id }: InventoryIdParam): Promise<InventoryExportItem> {
    try {
      const response = await this.request<InventoryExportItem>(`/export/${id}`);
      const validatedResponse = InventoryExportItemSchema.parse(response);

      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }
      throw new Error(`Failed to get inventory export: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Get a list of all recent exports of your inventory
   *
   * @returns {InventoryExportsResponse} The inventory exports
   * @throws {DiscogsAuthenticationError} If the request is not authenticated
   * @throws {Error} If there's an unexpected error
   */
  async getExports(): Promise<InventoryExportsResponse> {
    try {
      const response = await this.request<InventoryExportsResponse>('/export');

      const validatedResponse = InventoryExportsResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }
      throw new Error(`Failed to get inventory exports: ${String(error)}`, { cause: error });
    }
  }
}
