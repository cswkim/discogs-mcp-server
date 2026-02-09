import { isDiscogsError } from '../../errors.js';
import {
  type UserInventoryGetParams,
  type UserInventoryResponse,
  UserInventoryResponseSchema,
} from '../../types/user/index.js';
import { BaseUserService } from '../index.js';

/**
 * Service for Discogs User Inventory operations
 */
export class UserInventoryService extends BaseUserService {
  /**
   * Returns the list of listings in a user's inventory
   * @param params - Parameters for the request including username and optional pagination/sorting
   * @returns {UserInventoryResponse} A paginated response containing the user's inventory
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async get({ username, ...options }: UserInventoryGetParams): Promise<UserInventoryResponse> {
    try {
      const response = await this.request<UserInventoryResponse>(`/${username}/inventory`, {
        params: options,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserInventoryResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get inventory: ${String(error)}`, { cause: error });
    }
  }
}
