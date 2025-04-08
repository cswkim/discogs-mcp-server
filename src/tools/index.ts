import { FastMCP } from 'fastmcp';
import { registerUserCollectionTools } from './userCollection.js';
import { registerUserIdentityTools } from './userIdentity.js';
import { registerUserWantlistTools } from './userWantlist.js';
/**
 * Registers all MCP tools with the server
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  registerUserIdentityTools(server);
  registerUserCollectionTools(server);
  registerUserWantlistTools(server);
}
