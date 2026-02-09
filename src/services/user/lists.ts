import { isDiscogsError } from '../../errors.js';
import { type UserLists, type UserListsParams, UserListsSchema } from '../../types/user/index.js';
import { BaseUserService } from '../index.js';

/**
 * Service for Discogs User Lists operations
 */
export class UserListsService extends BaseUserService {
  /**
   * Get a user's lists
   * @param params - Parameters for the request including username and optional pagination/sorting
   * @returns {UserLists} A paginated response containing the user's lists
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {DiscogsResourceNotFoundError} If the username cannot be found
   * @throws {Error} If there's a validation error or other unexpected error
   */
  async get({ username, ...options }: UserListsParams): Promise<UserLists> {
    try {
      const response = await this.request<UserLists>(`/${username}/lists`, {
        params: options,
      });

      // Validate the response using Zod schema
      const validatedResponse = UserListsSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      // If it's already a Discogs error, just rethrow it
      if (isDiscogsError(error)) {
        throw error;
      }

      // For validation errors or other unexpected errors, wrap them
      throw new Error(`Failed to get lists: ${String(error)}`, { cause: error });
    }
  }
}
