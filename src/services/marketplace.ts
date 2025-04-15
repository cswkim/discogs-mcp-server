import { isDiscogsError } from '../errors.js';
import { Listing, ListingGetParams, ListingSchema } from '../types/marketplace.js';
import { DiscogsService } from './index.js';

export class MarketplaceService extends DiscogsService {
  constructor() {
    super('/marketplace');
  }

  /**
   * The Listing resource allows you to view Marketplace listings
   *
   * @param params - Parameters containing the listing ID and optional currency code
   * @returns {Listing} The listing information
   * @throws {DiscogsResourceNotFoundError} If the listing cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async getListing({ listing_id, ...options }: ListingGetParams): Promise<Listing> {
    try {
      const response = await this.request<Listing>(`/listings/${listing_id}`, {
        params: options,
      });

      const validatedResponse = ListingSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get listing: ${String(error)}`);
    }
  }
}
