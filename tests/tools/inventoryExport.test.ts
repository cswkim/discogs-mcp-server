import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors.js';
import { InventoryService } from '../../src/services/inventory.js';
import {
  downloadInventoryExportTool,
  getInventoryExportTool,
  getInventoryExportsTool,
  inventoryExportTool,
} from '../../src/tools/inventoryExport.js';
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

  describe('get_inventory_exports', () => {
    it('adds get_inventory_exports tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getInventoryExportsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_inventory_exports',
                description: 'Get a list of all recent exports of your inventory',
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

    it('calls get_inventory_exports tool', async () => {
      const mockExports = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first: 'https://api.discogs.com/inventory/export?page=1',
            prev: undefined,
            next: undefined,
            last: 'https://api.discogs.com/inventory/export?page=1',
          },
        },
        items: [
          {
            id: 123,
            status: 'Finished',
            created_ts: '2024-01-01T00:00:00Z',
            url: 'https://api.discogs.com/inventory/export/123',
            finished_ts: '2024-01-01T00:01:00Z',
            download_url: 'https://api.discogs.com/inventory/export/123/download',
            filename: 'inventory_20240101.csv',
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'getExports').mockResolvedValue(mockExports);
          server.addTool(getInventoryExportsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_inventory_exports',
              arguments: {},
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockExports) }],
          });
        },
      });
    });

    it('handles get_inventory_exports DiscogsAuthenticationError properly', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'getExports').mockRejectedValue(
            formatDiscogsError('Authentication error'),
          );

          server.addTool(getInventoryExportsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_inventory_exports',
              arguments: {},
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Authentication error' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_inventory_exports invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getInventoryExportsTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_inventory_exports',
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

  describe('get_inventory_export', () => {
    it('adds get_inventory_export tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_inventory_export',
                description: 'Get details about an inventory export',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                  },
                  required: ['id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_inventory_export tool', async () => {
      const mockExport = {
        id: 123,
        status: 'Finished',
        created_ts: '2024-01-01T00:00:00Z',
        url: 'https://api.discogs.com/inventory/export/123',
        finished_ts: '2024-01-01T00:01:00Z',
        download_url: 'https://api.discogs.com/inventory/export/123/download',
        filename: 'inventory_20240101.csv',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'getExport').mockResolvedValue(mockExport);
          server.addTool(getInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_inventory_export',
              arguments: { id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockExport) }],
          });
        },
      });
    });

    it('handles get_inventory_export DiscogsAuthenticationError properly', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'getExport').mockRejectedValue(
            formatDiscogsError('Authentication error'),
          );

          server.addTool(getInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_inventory_export',
              arguments: { id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Authentication error' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_inventory_export DiscogsResourceNotFoundError properly', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'getExport').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_inventory_export',
              arguments: { id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_inventory_export invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_inventory_export',
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

  describe('download_inventory_export', () => {
    it('adds download_inventory_export tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(downloadInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'download_inventory_export',
                description: 'Download an inventory export as a CSV',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                  },
                  required: ['id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls download_inventory_export tool', async () => {
      const mockCsv = 'id,title,artist\n1,Album,Artist';

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'downloadExport').mockResolvedValue(mockCsv);
          server.addTool(downloadInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'download_inventory_export',
              arguments: { id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: mockCsv }],
          });
        },
      });
    });

    it('handles download_inventory_export DiscogsAuthenticationError properly', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'downloadExport').mockRejectedValue(
            formatDiscogsError('Authentication error'),
          );

          server.addTool(downloadInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'download_inventory_export',
              arguments: { id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Authentication error' }],
            isError: true,
          });
        },
      });
    });

    it('handles download_inventory_export DiscogsResourceNotFoundError properly', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(InventoryService.prototype, 'downloadExport').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(downloadInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'download_inventory_export',
              arguments: { id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles download_inventory_export invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(downloadInventoryExportTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'download_inventory_export',
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
