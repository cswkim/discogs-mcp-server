import { isDiscogsError } from '../errors.js';
import { ListSchema, type List, type ListIdParam } from '../types/list.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs List-related operations
 */
export class ListService extends DiscogsService {
  constructor() {
    super('/lists');
  }

  /**
   * Returns items from a specified List
   *
   * @param params - Parameters containing the list ID
   * @returns {List} The list information
   * @throws {DiscogsPermissionError} If the user doesn't have permission to access the list
   * @throws {DiscogsResourceNotFoundError} If the list cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async getList({ list_id }: ListIdParam): Promise<List> {
    try {
      const response = await this.request<List>(`/${list_id}`);

      // Validate the response using Zod schema
      const validatedResponse = ListSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get list: ${String(error)}`);
    }
  }
}
