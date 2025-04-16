import { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { MarketplaceService } from '../services/marketplace.js';
import {
  ListingGetParamsSchema,
  ListingIdParamSchema,
  ListingNewParamsSchema,
  ListingUpdateParamsSchema,
  OrderIdParamSchema,
} from '../types/marketplace.js';

/**
 * MCP tool for creating a marketplace listing
 */
export const createMarketplaceListingTool: Tool<undefined, typeof ListingNewParamsSchema> = {
  name: 'create_marketplace_listing',
  description: 'Create a new marketplace listing',
  parameters: ListingNewParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const listing = await marketplaceService.createListing(args);

      return JSON.stringify(listing);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for deleting a marketplace listing
 */
export const deleteMarketplaceListingTool: Tool<undefined, typeof ListingIdParamSchema> = {
  name: 'delete_marketplace_listing',
  description: 'Delete a marketplace listing',
  parameters: ListingIdParamSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      await marketplaceService.deleteListing(args);

      return 'Listing deleted successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for getting a marketplace listing
 */
export const getMarketplaceListingTool: Tool<undefined, typeof ListingGetParamsSchema> = {
  name: 'get_marketplace_listing',
  description: 'Get a listing from the marketplace',
  parameters: ListingGetParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const listing = await marketplaceService.getListing(args);

      return JSON.stringify(listing);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for getting a marketplace order
 */
export const getMarketplaceOrderTool: Tool<undefined, typeof OrderIdParamSchema> = {
  name: 'get_marketplace_order',
  description: 'Get a marketplace order',
  parameters: OrderIdParamSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const order = await marketplaceService.getOrder(args);

      return JSON.stringify(order);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for updating a marketplace listing
 */
export const updateMarketplaceListingTool: Tool<undefined, typeof ListingUpdateParamsSchema> = {
  name: 'update_marketplace_listing',
  description: 'Update a marketplace listing',
  parameters: ListingUpdateParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      await marketplaceService.updateListing(args);

      return 'Listing updated successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerMarketplaceTools(server: FastMCP): void {
  server.addTool(getMarketplaceListingTool);
  server.addTool(createMarketplaceListingTool);
  server.addTool(updateMarketplaceListingTool);
  server.addTool(deleteMarketplaceListingTool);
  server.addTool(getMarketplaceOrderTool);
}
