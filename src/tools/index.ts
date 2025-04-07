import { FastMCP } from 'fastmcp';
import { registerUserIdentityTools } from './userIdentity.js';

/**
 * Registers all MCP tools with the server
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  registerUserIdentityTools(server);
}
