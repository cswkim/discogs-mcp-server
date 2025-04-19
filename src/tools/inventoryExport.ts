import type { FastMCP, Tool, ToolParameters } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { InventoryService } from '../services/inventory.js';
import { InventoryIdParamSchema } from '../types/inventory.js';

/**
 * MCP tool for getting a specific inventory export by ID
 */
export const getInventoryExportTool: Tool<undefined, typeof InventoryIdParamSchema> = {
  name: 'get_inventory_export',
  description: 'Get details about an inventory export',
  parameters: InventoryIdParamSchema,
  execute: async (args) => {
    try {
      const inventoryService = new InventoryService();
      const exportItem = await inventoryService.getExport(args);

      return JSON.stringify(exportItem);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for getting a list of inventory exports
 */
export const getInventoryExportsTool: Tool<undefined, ToolParameters> = {
  name: 'get_inventory_exports',
  description: 'Get a list of all recent exports of your inventory',
  parameters: z.object({}),
  execute: async () => {
    try {
      const inventoryService = new InventoryService();
      const exports = await inventoryService.getExports();

      return JSON.stringify(exports);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

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
  server.addTool(getInventoryExportsTool);
  server.addTool(getInventoryExportTool);
}
