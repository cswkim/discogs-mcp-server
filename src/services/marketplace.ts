import { isDiscogsError } from '../errors.js';
import {
  type Listing,
  type ListingGetParams,
  type ListingIdParam,
  type ListingNewParams,
  type ListingNewResponse,
  ListingNewResponseSchema,
  ListingSchema,
  type ListingUpdateParams,
} from '../types/marketplace.js';
import { DiscogsService } from './index.js';

export class MarketplaceService extends DiscogsService {
  constructor() {
    super('/marketplace');
  }

  /**
   * Create a new marketplace listing
   *
   * @param params - Parameters containing the listing data
   * @returns {ListingNewResponse} The listing information
   * @throws {DiscogsPermissionError} If the user does not have permission to create a listing
   * @throws {Error} If there's an unexpected error
   */
  async createListing(params: ListingNewParams): Promise<ListingNewResponse> {
    try {
      const response = await this.request<ListingNewResponse>(`/listings`, {
        method: 'POST',
        body: params,
      });

      const validatedResponse = ListingNewResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to create listing: ${String(error)}`);
    }
  }

  /**
   * Delete a listing from the marketplace
   *
   * @param params - Parameters containing the listing ID
   * @throws {DiscogsPermissionError} If the user does not have permission to delete a listing
   * @throws {DiscogsResourceNotFoundError} If the listing cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async deleteListing({ listing_id }: ListingIdParam): Promise<void> {
    try {
      await this.request<void>(`/listings/${listing_id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to delete listing: ${String(error)}`);
    }
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

  /**
   * Update a marketplace listing
   *
   * @param params - Parameters containing the listing ID and the listing data
   * @throws {DiscogsResourceNotFoundError} If the listing cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async updateListing({ listing_id, ...body }: ListingUpdateParams): Promise<void> {
    try {
      await this.request<void>(`/listings/${listing_id}`, {
        method: 'POST',
        body,
      });
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to update listing: ${String(error)}`);
    }
  }
}
