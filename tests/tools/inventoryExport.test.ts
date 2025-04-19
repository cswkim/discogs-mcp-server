import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors.js';
import { InventoryService } from '../../src/services/inventory.js';
import { inventoryExportTool } from '../../src/tools/inventoryExport.js';
import { runWithTestServer } from '../utils/testServer.js';

describe('Inventory Export Tool', () => {
  describe('inventory_export', () => {
    it('adds inventory_export tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(inventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'inventory_export',
                description: 'Request an export of your inventory as a CSV',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {},
                },
              },
            ],
          });
        },
      });
    });

    it('calls inventory_export tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'export').mockResolvedValue(undefined);
          server.addTool(inventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'inventory_export',
              arguments: {},
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Inventory export requested' }],
          });
        },
      });
    });

    it('handles inventory_export DiscogsAuthenticationError properly', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'export').mockRejectedValue(
            formatDiscogsError('Authentication error'),
          );

          server.addTool(inventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'inventory_export',
              arguments: {},
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Authentication error' }],
            isError: true,
          });
        },
      });
    });

    it('handles inventory_export invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(inventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'inventory_export',
              arguments: { invalid: 'parameter' },
            });
          } catch (error) {
            expect(error).toBeInstanceOf(McpError);
            expect(error.code).toBe(ErrorCode.InvalidParams);
          }
        },
      });
    });
  });
});
