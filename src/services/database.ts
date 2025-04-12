import { isDiscogsError } from '../errors.js';
import { type SearchParams, type SearchResults, SearchResultsSchema } from '../types/database.js';
import { DiscogsService } from './index.js';

/**
 * Service for Discogs Database-related operations
 */
export class DatabaseService extends DiscogsService {
  constructor() {
    super('/database');
  }

  /**
   * Issue a search query to the Discogs database
   *
   * @param params - Search parameters
   * @throws {DiscogsAuthenticationError} If authentication fails
   * @throws {Error} If the search times out or an unexpected error occurs
   * @returns {SearchResults} Search results
   */
  async search(params: SearchParams): Promise<SearchResults> {
    try {
      const response = await this.request<SearchResults>('/search', { params });

      const validatedResponse = SearchResultsSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to search database: ${String(error)}`);
    }
  }
}
