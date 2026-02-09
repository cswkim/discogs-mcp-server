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
  OrderCreateMessageParams,
  type OrderEditParams,
  type OrderIdParam,
  type OrderMessageResponse,
  OrderMessageSchema,
  type OrderMessagesParams,
  type OrderMessagesResponse,
  OrderMessagesResponseSchema,
  type OrderResponse,
  OrderResponseSchema,
  type OrdersParams,
  type OrdersResponse,
  OrdersResponseSchema,
  type ReleaseStatsResponse,
  ReleaseStatsResponseSchema,
} from '../types/marketplace.js';
import type { ReleaseParams } from '../types/release.js';
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
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
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

      throw new Error(`Failed to create listing: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Adds a new message to the order's message log
   *
   * @param params - Parameters containing the order ID and the message data
   * @returns {OrderMessageResponse} The order message information
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
   * @throws {DiscogsPermissionError} If the user does not have permission to create a message
   * @throws {DiscogsResourceNotFoundError} If the order cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async createOrderMessage({
    order_id,
    ...body
  }: OrderCreateMessageParams): Promise<OrderMessageResponse> {
    try {
      const response = await this.request<OrderMessageResponse>(`/orders/${order_id}/messages`, {
        method: 'POST',
        body,
      });

      const validatedResponse = OrderMessageSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to create order message: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Delete a listing from the marketplace
   *
   * @param params - Parameters containing the listing ID
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
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

      throw new Error(`Failed to delete listing: ${String(error)}`, { cause: error });
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

      throw new Error(`Failed to get listing: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Get a marketplace order
   *
   * @param params - Parameters containing the order ID
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
   * @throws {DiscogsPermissionError} If the user does not have permission to view the order
   * @throws {DiscogsResourceNotFoundError} If the order cannot be found
   * @throws {Error} If there's an unexpected error
   * @returns {OrderResponse} The order information
   */
  async getOrder({ order_id }: OrderIdParam): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(`/orders/${order_id}`);

      const validatedResponse = OrderResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get order: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Get a list of an order's messages
   *
   * @param params - OrderMessagesParams
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
   * @throws {DiscogsPermissionError} If the user does not have permission to view the order messages
   * @throws {DiscogsResourceNotFoundError} If the order cannot be found
   * @throws {Error} If there's an unexpected error
   * @returns {OrderMessagesResponse} The order messages
   */
  async getOrderMessages({
    order_id,
    ...options
  }: OrderMessagesParams): Promise<OrderMessagesResponse> {
    try {
      const response = await this.request<OrderMessagesResponse>(`/orders/${order_id}/messages`, {
        params: options,
      });

      const validatedResponse = OrderMessagesResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get order messages: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Get a list of marketplace orders
   *
   * @param params - OrdersParams
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
   * @throws {DiscogsPermissionError} If the user does not have permission to view the orders
   * @throws {Error} If there's an unexpected error
   * @returns {OrdersResponse} The order information
   */
  async getOrders(params: OrdersParams): Promise<OrdersResponse> {
    try {
      const response = await this.request<OrdersResponse>(`/orders`, {
        params,
      });

      const validatedResponse = OrdersResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get orders: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Retrieve marketplace statistics for the provided Release ID
   *
   * @param params - Parameters containing the release ID and optional currency code
   * @throws {DiscogsResourceNotFoundError} If the release cannot be found
   * @throws {Error} If there's an unexpected error
   * @returns {ReleaseStatsResponse} The release stats
   */
  async getReleaseStats({ release_id, ...options }: ReleaseParams): Promise<ReleaseStatsResponse> {
    try {
      const response = await this.request<ReleaseStatsResponse>(`/stats/${release_id}`, {
        params: options,
      });

      const validatedResponse = ReleaseStatsResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get release stats: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Edit a marketplace order
   *
   * @param params - Parameters containing the order ID and the order data
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
   * @throws {DiscogsPermissionError} If the user does not have permission to edit the order
   * @throws {DiscogsResourceNotFoundError} If the order cannot be found
   * @throws {Error} If there's an unexpected error
   */
  async editOrder({ order_id, ...body }: OrderEditParams): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(`/orders/${order_id}`, {
        method: 'POST',
        body,
      });

      const validatedResponse = OrderResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to edit order: ${String(error)}`, { cause: error });
    }
  }

  /**
   * Update a marketplace listing
   *
   * @param params - Parameters containing the listing ID and the listing data
   * @throws {DiscogsAuthenticationError} If the user is not authenticated
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

      throw new Error(`Failed to update listing: ${String(error)}`, { cause: error });
    }
  }
}
