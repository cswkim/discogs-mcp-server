import { FastMCP } from 'fastmcp';
import { getIdentityTool } from './identity.js';

/**
 * Registers all MCP tools with the server
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  server.addTool(getIdentityTool);
}
