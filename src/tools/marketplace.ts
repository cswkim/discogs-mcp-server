import { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { MarketplaceService } from '../services/marketplace.js';
import { UserInventoryService } from '../services/user/inventory.js';
import { FastMCPSessionAuth } from '../types/common.js';
import {
  ListingGetParamsSchema,
  ListingIdParamSchema,
  ListingNewParamsSchema,
  ListingUpdateParamsSchema,
  OrderCreateMessageParamsSchema,
  OrderEditParamsSchema,
  OrderIdParamSchema,
  OrderMessagesParamsSchema,
  OrdersParamsSchema,
} from '../types/marketplace.js';
import { ReleaseParamsSchema } from '../types/release.js';
import { UserInventoryGetParamsSchema } from '../types/user/index.js';

/**
 * MCP tool for creating a marketplace listing
 */
export const createMarketplaceListingTool: Tool<FastMCPSessionAuth, typeof ListingNewParamsSchema> =
  {
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
 * MCP tool for creating a marketplace order message
 */
export const createMarketplaceOrderMessageTool: Tool<
  FastMCPSessionAuth,
  typeof OrderCreateMessageParamsSchema
> = {
  name: 'create_marketplace_order_message',
  description: `Adds a new message to the order's message log`,
  parameters: OrderCreateMessageParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const message = await marketplaceService.createOrderMessage(args);

      return JSON.stringify(message);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for deleting a marketplace listing
 */
export const deleteMarketplaceListingTool: Tool<FastMCPSessionAuth, typeof ListingIdParamSchema> = {
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
export const getMarketplaceListingTool: Tool<FastMCPSessionAuth, typeof ListingGetParamsSchema> = {
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
export const getMarketplaceOrderTool: Tool<FastMCPSessionAuth, typeof OrderIdParamSchema> = {
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
 * MCP tool for getting a list of marketplace orders
 */
export const getMarketplaceOrdersTool: Tool<FastMCPSessionAuth, typeof OrdersParamsSchema> = {
  name: 'get_marketplace_orders',
  description: 'Get a list of marketplace orders',
  parameters: OrdersParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const orders = await marketplaceService.getOrders(args);

      return JSON.stringify(orders);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for getting a list of order messages
 */
export const getMarketplaceOrderMessagesTool: Tool<
  FastMCPSessionAuth,
  typeof OrderMessagesParamsSchema
> = {
  name: 'get_marketplace_order_messages',
  description: `Get a list of an order's messages`,
  parameters: OrderMessagesParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const messages = await marketplaceService.getOrderMessages(args);

      return JSON.stringify(messages);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for getting a release stats
 */
export const getMarketplaceReleaseStatsTool: Tool<FastMCPSessionAuth, typeof ReleaseParamsSchema> =
  {
    name: 'get_marketplace_release_stats',
    description: 'Retrieve marketplace statistics for the provided Release ID',
    parameters: ReleaseParamsSchema,
    execute: async (args) => {
      try {
        const marketplaceService = new MarketplaceService();
        const stats = await marketplaceService.getReleaseStats(args);

        return JSON.stringify(stats);
      } catch (error) {
        throw formatDiscogsError(error);
      }
    },
  };

/**
 * MCP tool for getting a user's inventory
 */
export const getUserInventoryTool: Tool<FastMCPSessionAuth, typeof UserInventoryGetParamsSchema> = {
  name: 'get_user_inventory',
  description: `Returns the list of listings in a user's inventory`,
  parameters: UserInventoryGetParamsSchema,
  execute: async (args) => {
    try {
      const userInventoryService = new UserInventoryService();
      const inventory = await userInventoryService.get(args);

      return JSON.stringify(inventory);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for editing a marketplace order
 */
export const editMarketplaceOrderTool: Tool<FastMCPSessionAuth, typeof OrderEditParamsSchema> = {
  name: 'edit_marketplace_order',
  description: 'Edit a marketplace order',
  parameters: OrderEditParamsSchema,
  execute: async (args) => {
    try {
      const marketplaceService = new MarketplaceService();
      const order = await marketplaceService.editOrder(args);

      return JSON.stringify(order);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for updating a marketplace listing
 */
export const updateMarketplaceListingTool: Tool<
  FastMCPSessionAuth,
  typeof ListingUpdateParamsSchema
> = {
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
  server.addTool(getUserInventoryTool);
  server.addTool(getMarketplaceListingTool);
  server.addTool(createMarketplaceListingTool);
  server.addTool(updateMarketplaceListingTool);
  server.addTool(deleteMarketplaceListingTool);
  server.addTool(getMarketplaceOrderTool);
  server.addTool(editMarketplaceOrderTool);
  server.addTool(getMarketplaceOrdersTool);
  server.addTool(getMarketplaceOrderMessagesTool);
  server.addTool(createMarketplaceOrderMessageTool);
  server.addTool(getMarketplaceReleaseStatsTool);
}
