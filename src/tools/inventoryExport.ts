import type { FastMCP, Tool, ToolParameters } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { InventoryService } from '../services/inventory.js';

/**
 * MCP tool for exporting your inventory as a CSV
 */
export const inventoryExportTool: Tool<undefined, ToolParameters> = {
  name: 'inventory_export',
  description: 'Request an export of your inventory as a CSV',
  parameters: z.object({}),
  execute: async () => {
    try {
      const inventoryService = new InventoryService();
      await inventoryService.export();

      return 'Inventory export requested';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerInventoryExportTool(server: FastMCP): void {
  server.addTool(inventoryExportTool);
}
