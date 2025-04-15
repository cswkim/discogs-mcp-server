import { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { MarketplaceService } from '../services/marketplace.js';
import { ListingGetParamsSchema } from '../types/marketplace.js';

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

export function registerMarketplaceTools(server: FastMCP): void {
  server.addTool(getMarketplaceListingTool);
}
