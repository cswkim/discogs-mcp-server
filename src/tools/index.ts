import { FastMCP } from 'fastmcp';
import { registerDatabaseTools } from './database.js';
import { registerInventoryExportTool } from './inventoryExport.js';
import { registerMarketplaceTools } from './marketplace.js';
import { registerMediaTools } from './media.js';
import { registerUserCollectionTools } from './userCollection.js';
import { registerUserIdentityTools } from './userIdentity.js';
import { registerUserListsTools } from './userLists.js';
import { registerUserWantlistTools } from './userWantlist.js';

/**
 * Registers all MCP tools with the server
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  registerDatabaseTools(server);
  registerMarketplaceTools(server);
  registerInventoryExportTool(server);
  registerUserIdentityTools(server);
  registerUserCollectionTools(server);
  registerUserWantlistTools(server);
  registerUserListsTools(server);
  registerMediaTools(server);
}
