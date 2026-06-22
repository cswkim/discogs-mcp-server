import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { fetchImageTool } from '../../src/tools/media.js';
import { mockImageContent, mockImageUrl } from '../utils/testImageData.js';
import { runWithTestServer } from '../utils/testServer.js';

vi.mock('fastmcp', async () => {
  const actual = await vi.importActual<typeof import('fastmcp')>('fastmcp');
  const { mockImageContent } = await import('../utils/testImageData.js');
  return {
    ...actual,
    imageContent: vi.fn().mockResolvedValue({
      content: [mockImageContent],
    }),
  };
});

describe('Media Tools', () => {
  describe('fetch_image', () => {
    it('adds fetch_image tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(fetchImageTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'fetch_image',
                description: 'Fetch an image by URL',
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    url: { type: 'string', format: 'uri' },
                  },
                  required: ['url'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls fetch_image tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(fetchImageTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'fetch_image',
              arguments: {
                url: mockImageUrl,
              },
            }),
          ).toEqual({
            content: [mockImageContent],
          });
        },
      });
    });

    it('handles fetch_image invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(fetchImageTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'fetch_image',
              arguments: {},
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
