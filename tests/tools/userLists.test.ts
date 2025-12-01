import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors.js';
import { ListService } from '../../src/services/list.js';
import { UserListsService } from '../../src/services/user/lists.js';
import { getListTool, getUserListsTool } from '../../src/tools/userLists.js';
import { runWithTestServer } from '../utils/testServer.js';

describe('User Lists Tools', () => {
  describe('get_user_lists', () => {
    it('adds get_user_lists tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserListsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_lists',
                description: "Get a user's lists",
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    page: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: { type: 'string', enum: [] },
                    sort_order: { type: 'string', enum: ['asc', 'desc'] },
                  },
                  required: ['username'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_user_lists tool', async () => {
      const mockLists = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first: 'https://api.discogs.com/users/testuser/lists?page=1&per_page=50',
            last: 'https://api.discogs.com/users/testuser/lists?page=1&per_page=50',
          },
        },
        lists: [
          {
            id: 123,
            name: 'Test List',
            description: 'Test description',
            public: true,
            date_added: '2024-01-01T00:00:00Z',
            date_changed: '2024-01-01T00:00:00Z',
            resource_url: 'https://api.discogs.com/users/testuser/lists/123',
            uri: 'https://www.discogs.com/users/testuser/lists/123',
            items: 0,
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserListsService.prototype, 'get').mockResolvedValue(mockLists);
          server.addTool(getUserListsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_lists',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockLists) }],
          });
        },
      });
    });

    it('handles get_user_lists DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserListsService.prototype, 'get').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserListsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_lists',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_user_lists invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserListsTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_lists',
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

  describe('get_list', () => {
    it('adds get_list tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getListTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_list',
                description: 'Get a list by ID',
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    list_id: {
                      type: 'number',
                    },
                  },
                  required: ['list_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_list tool', async () => {
      const mockList = {
        id: 123,
        user: {
          id: 456,
          username: 'testuser',
          avatar_url: 'https://api.discogs.com/users/testuser/avatar.jpg',
          resource_url: 'https://api.discogs.com/users/testuser',
        },
        name: 'Test List',
        description: 'Test description',
        public: true,
        date_added: '2024-01-01T00:00:00Z',
        date_changed: '2024-01-01T00:00:00Z',
        resource_url: 'https://api.discogs.com/users/testuser/lists/123',
        uri: 'https://www.discogs.com/users/testuser/lists/123',
        image_url: 'https://api.discogs.com/users/testuser/lists/123/image.jpg',
        items: [
          {
            id: 789,
            type: 'release',
            comment: 'Test comment',
            display_title: 'Test Release',
            image_url: 'https://api.discogs.com/releases/789/image.jpg',
            uri: 'https://www.discogs.com/release/789',
            resource_url: 'https://api.discogs.com/releases/789',
            stats: {
              community: {
                in_collection: 100,
                in_wantlist: 50,
              },
              user: {
                in_collection: 1,
                in_wantlist: 0,
              },
            },
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ListService.prototype, 'getList').mockResolvedValue(mockList);
          server.addTool(getListTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_list',
              arguments: {
                list_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockList) }],
          });
        },
      });
    });

    it('handles get_list DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ListService.prototype, 'getList').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getListTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_list',
              arguments: {
                list_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_list invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getListTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_list',
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
