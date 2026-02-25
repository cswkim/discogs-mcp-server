import { FastMCP } from 'fastmcp';
import { registerDatabaseTools } from './database.js';
import { registerInventoryExportTool } from './inventoryExport.js';
import { registerMarketplaceTools } from './marketplace.js';
import { registerMediaTools } from './media.js';
import { registerUserCollectionTools } from './userCollection.js';
import { registerUserIdentityTools } from './userIdentity.js';
import { registerUserListsTools } from './userLists.js';
import { registerUserWantlistTools } from './userWantlist.js';

export interface ToolRegistrationOptions {
  readOnly?: boolean;
}

/**
 * Registers all MCP tools with the server
 * @param server The FastMCP server instance
 * @param options Registration options (e.g. readOnly mode)
 */
export function registerTools(server: FastMCP, options?: ToolRegistrationOptions): void {
  registerDatabaseTools(server, options);
  registerMarketplaceTools(server, options);
  registerInventoryExportTool(server, options);
  registerUserIdentityTools(server, options);
  registerUserCollectionTools(server, options);
  registerUserWantlistTools(server, options);
  registerUserListsTools(server, options);
  registerMediaTools(server, options);
}
