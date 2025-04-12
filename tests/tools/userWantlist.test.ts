import { FastMCP } from 'fastmcp';
import { describe, expect, test, vi } from 'vitest';
import { UserWantsService } from '../../src/services/user/wants.js';
import {
  addToWantlistTool,
  deleteItemInWantlistTool,
  editItemInWantlistTool,
  getUserWantlistTool,
} from '../../src/tools/userWantlist.js';
import { runWithTestServer } from '../utils/testServer.js';

const mockWantlistItem = {
  id: 123,
  rating: 5,
  notes: 'Test notes',
  resource_url: 'https://api.discogs.com/users/testuser/wants/123',
  basic_information: {
    id: 123,
    title: 'Test Release',
    year: 2024,
    resource_url: 'https://api.discogs.com/releases/123',
    thumb: 'https://api.discogs.com/releases/123/thumb',
    cover_image: 'https://api.discogs.com/releases/123/image',
    formats: [{ name: 'Vinyl', qty: '1', text: '12"', descriptions: ['LP'] }],
    labels: [
      {
        id: 1,
        name: 'Test Label',
        resource_url: 'https://api.discogs.com/labels/1',
        catno: 'TEST001',
        entity_type: '1',
        entity_type_name: 'Label',
      },
    ],
    artists: [
      {
        id: 1,
        name: 'Test Artist',
        resource_url: 'https://api.discogs.com/artists/1',
        join: ',',
        anv: '',
        role: '',
        tracks: '',
      },
    ],
    genres: ['Electronic'],
    styles: ['House'],
    master_id: 202,
    master_url: 'https://api.discogs.com/masters/202',
  },
};

const mockWantlist = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 1,
    urls: {
      first: 'https://api.discogs.com/users/testuser/wants?page=1&per_page=50',
      last: 'https://api.discogs.com/users/testuser/wants?page=1&per_page=50',
    },
  },
  wants: [mockWantlistItem],
};

describe('User Wantlist Tools', () => {
  describe('get_user_wantlist', () => {
    test('adds get_user_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_wantlist',
                description: `Returns the list of releases in a user's wantlist`,
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    page: { type: 'integer', minimum: 1 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: {
                      type: 'string',
                      enum: ['added', 'artist', 'label', 'rating', 'title', 'year'],
                    },
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

    test('calls get_user_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserWantsService.prototype, 'getList').mockResolvedValue(mockWantlist);
          server.addTool(getUserWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_wantlist',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockWantlist) }],
          });
        },
      });
    });
  });

  describe('add_to_wantlist', () => {
    test('adds add_to_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(addToWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'add_to_wantlist',
                description: `Add a release to a user's wantlist`,
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    release_id: { type: 'number', minimum: 1 },
                    notes: { type: 'string' },
                    rating: { type: 'integer', minimum: 0, maximum: 5 },
                  },
                  required: ['username', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    test('calls add_to_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserWantsService.prototype, 'addItem').mockResolvedValue(mockWantlistItem);
          server.addTool(addToWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'add_to_wantlist',
              arguments: {
                username: 'testuser',
                release_id: 123,
                notes: 'Test notes',
                rating: 5,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockWantlistItem) }],
          });
        },
      });
    });
  });

  describe('edit_item_in_wantlist', () => {
    test('adds edit_item_in_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editItemInWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'edit_item_in_wantlist',
                description: `Edit a release in a user's wantlist`,
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    release_id: { type: 'number', minimum: 1 },
                    notes: { type: 'string' },
                    rating: { type: 'integer', minimum: 0, maximum: 5 },
                  },
                  required: ['username', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    test('calls edit_item_in_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserWantsService.prototype, 'editItem').mockResolvedValue(mockWantlistItem);
          server.addTool(editItemInWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_item_in_wantlist',
              arguments: {
                username: 'testuser',
                release_id: 123,
                rating: 4,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockWantlistItem) }],
          });
        },
      });
    });
  });

  describe('delete_item_in_wantlist', () => {
    test('adds delete_item_in_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteItemInWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'delete_item_in_wantlist',
                description: `Delete a release from a user's wantlist`,
                inputSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    release_id: { type: 'number', minimum: 1 },
                    notes: { type: 'string' },
                    rating: { type: 'integer', minimum: 0, maximum: 5 },
                  },
                  required: ['username', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    test('calls delete_item_in_wantlist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserWantsService.prototype, 'deleteItem').mockResolvedValue(undefined);
          server.addTool(deleteItemInWantlistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_item_in_wantlist',
              arguments: {
                username: 'testuser',
                release_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Release deleted from wantlist' }],
          });
        },
      });
    });
  });
});
