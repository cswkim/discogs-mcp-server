import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors.js';
import { UserCollectionService } from '../../src/services/user/collection.js';
import {
  addReleaseToUserCollectionFolderTool,
  createUserCollectionFolderTool,
  deleteReleaseFromUserCollectionFolderTool,
  deleteUserCollectionFolderTool,
  editUserCollectionCustomFieldValueTool,
  editUserCollectionFolderTool,
  findReleaseInUserCollectionTool,
  getUserCollectionCustomFieldsTool,
  getUserCollectionFolderTool,
  getUserCollectionFoldersTool,
  getUserCollectionItemsTool,
  getUserCollectionValueTool,
  moveReleaseInUserCollectionTool,
  rateReleaseInUserCollectionTool,
} from '../../src/tools/userCollection.js';
import { runWithTestServer } from '../utils/testServer.js';

describe('User Collection Tools', () => {
  describe('get_user_collection_folders', () => {
    it('adds get_user_collection_folders tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionFoldersTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_collection_folders',
                description: "Retrieve a list of folders in a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                  },
                  required: ['username'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_user_collection_folders tool', async () => {
      const mockFolders = {
        folders: [
          {
            id: 1,
            name: 'All',
            count: 100,
            resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
          },
          {
            id: 2,
            name: 'Uncategorized',
            count: 50,
            resource_url: 'https://api.discogs.com/users/testuser/collection/folders/2',
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getFolders').mockResolvedValue(mockFolders);
          server.addTool(getUserCollectionFoldersTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_folders',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFolders) }],
          });
        },
      });
    });

    it('handles get_user_collection_folders DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getFolders').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserCollectionFoldersTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_folders',
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

    it('handles get_user_collection_folders invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionFoldersTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_collection_folders',
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

  describe('get_user_collection_folder', () => {
    it('adds get_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_collection_folder',
                description: "Retrieve metadata about a folder in a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 0, maximum: 9007199254740991 },
                  },
                  required: ['username', 'folder_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_user_collection_folder tool', async () => {
      const mockFolder = {
        id: 1,
        name: 'All',
        count: 100,
        resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getFolder').mockResolvedValue(mockFolder);
          server.addTool(getUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFolder) }],
          });
        },
      });
    });

    it('handles get_user_collection_folder DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getFolder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_user_collection_folder invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_collection_folder',
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

  describe('create_user_collection_folder', () => {
    it('adds create_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(createUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'create_user_collection_folder',
                description: "Create a new folder in a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    username: { type: 'string', minLength: 1 },
                  },
                  required: ['username'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls create_user_collection_folder tool', async () => {
      const mockFolder = {
        id: 3,
        name: 'New Folder',
        count: 0,
        resource_url: 'https://api.discogs.com/users/testuser/collection/folders/3',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'createFolder').mockResolvedValue(mockFolder);
          server.addTool(createUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'create_user_collection_folder',
              arguments: {
                username: 'testuser',
                name: 'New Folder',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFolder) }],
          });
        },
      });
    });

    it('handles create_user_collection_folder DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'createFolder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(createUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'create_user_collection_folder',
              arguments: {
                username: 'testuser',
                name: 'New Folder',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles create_user_collection_folder invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(createUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'create_user_collection_folder',
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

  describe('edit_user_collection_folder', () => {
    it('adds edit_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'edit_user_collection_folder',
                description: "Edit a folder's metadata. Folders 0 and 1 cannot be renamed.",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 0, maximum: 9007199254740991 },
                    name: { type: 'string' },
                  },
                  required: ['username', 'folder_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls edit_user_collection_folder tool', async () => {
      const mockFolder = {
        id: 1,
        name: 'Updated Folder',
        count: 100,
        resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'editFolder').mockResolvedValue(mockFolder);
          server.addTool(editUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                name: 'Updated Folder',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFolder) }],
          });
        },
      });
    });

    it('handles edit_user_collection_folder DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'editFolder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(editUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                name: 'Updated Folder',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles edit_user_collection_folder invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'edit_user_collection_folder',
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

  describe('delete_user_collection_folder', () => {
    it('adds delete_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'delete_user_collection_folder',
                description:
                  "Delete a folder from a user's collection. A folder must be empty before it can be deleted.",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 0, maximum: 9007199254740991 },
                  },
                  required: ['username', 'folder_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls delete_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'deleteFolder').mockResolvedValue(undefined);
          server.addTool(deleteUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Folder deleted successfully' }],
          });
        },
      });
    });

    it('handles delete_user_collection_folder DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'deleteFolder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(deleteUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles delete_user_collection_folder invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'delete_user_collection_folder',
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

  describe('get_user_collection_items', () => {
    it('adds get_user_collection_items tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionItemsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_collection_items',
                description: "Retrieve a list of items in a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 0, maximum: 9007199254740991 },
                    page: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: {
                      type: 'string',
                      enum: [
                        'added',
                        'artist',
                        'catno',
                        'format',
                        'label',
                        'rating',
                        'title',
                        'year',
                      ],
                    },
                    sort_order: { type: 'string', enum: ['asc', 'desc'] },
                  },
                  required: ['username', 'folder_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_user_collection_items tool', async () => {
      const mockItems = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first:
              'https://api.discogs.com/users/testuser/collection/folders/1/releases?page=1&per_page=50',
            last: 'https://api.discogs.com/users/testuser/collection/folders/1/releases?page=1&per_page=50',
          },
        },
        releases: [
          {
            folder_id: 1,
            id: 123,
            instance_id: 456,
            rating: 5,
            basic_information: {
              id: 123,
              title: 'Test Release',
              year: 2024,
              resource_url: 'https://api.discogs.com/releases/123',
              cover_image: 'https://api.discogs.com/releases/123/image',
              thumb: 'https://api.discogs.com/releases/123/thumb',
              artists: [
                {
                  id: 789,
                  name: 'Test Artist',
                  resource_url: 'https://api.discogs.com/artists/789',
                  join: '',
                  role: '',
                  anv: '',
                  tracks: '',
                },
              ],
              labels: [],
              formats: [],
              genres: [],
              styles: [],
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

          vi.spyOn(UserCollectionService.prototype, 'getItems').mockResolvedValue(mockItems);
          server.addTool(getUserCollectionItemsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_items',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                page: 1,
                per_page: 50,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockItems) }],
          });
        },
      });
    });

    it('handles get_user_collection_items DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getItems').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserCollectionItemsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_items',
              arguments: {
                username: 'testuser',
                folder_id: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });
  });

  describe('add_release_to_user_collection_folder', () => {
    it('adds add_release_to_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(addReleaseToUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'add_release_to_user_collection_folder',
                description:
                  "Add a release to a folder in a user's collection. The folder_id must be non-zero.",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    release_id: { type: 'number', minimum: 1 },
                  },
                  required: ['username', 'folder_id', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls add_release_to_user_collection_folder tool', async () => {
      const mockAdded = {
        instance_id: 456,
        resource_url:
          'https://api.discogs.com/users/testuser/collection/releases/123/instances/456',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'addReleaseToFolder').mockResolvedValue(
            mockAdded,
          );
          server.addTool(addReleaseToUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'add_release_to_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockAdded) }],
          });
        },
      });
    });

    it('handles add_release_to_user_collection_folder DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'addReleaseToFolder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(addReleaseToUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'add_release_to_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles add_release_to_user_collection_folder invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(addReleaseToUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'add_release_to_user_collection_folder',
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

  describe('delete_release_from_user_collection_folder', () => {
    it('adds delete_release_from_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteReleaseFromUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'delete_release_from_user_collection_folder',
                description:
                  "Remove an instance of a release from a user's collection folder. The folder_id must be non-zero.",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    release_id: { type: 'number', minimum: 1 },
                    instance_id: {
                      type: 'integer',
                      minimum: -9007199254740991,
                      maximum: 9007199254740991,
                    },
                  },
                  required: ['username', 'folder_id', 'release_id', 'instance_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls delete_release_from_user_collection_folder tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'deleteReleaseFromFolder').mockResolvedValue(
            undefined,
          );
          server.addTool(deleteReleaseFromUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_release_from_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Release deleted successfully' }],
          });
        },
      });
    });

    it('handles delete_release_from_user_collection_folder DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'deleteReleaseFromFolder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(deleteReleaseFromUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_release_from_user_collection_folder',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles delete_release_from_user_collection_folder invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteReleaseFromUserCollectionFolderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'delete_release_from_user_collection_folder',
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

  describe('find_release_in_user_collection', () => {
    it('adds find_release_in_user_collection tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(findReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'find_release_in_user_collection',
                description: "Find a release in a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    release_id: { type: 'number', minimum: 1 },
                    page: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: { type: 'string', enum: [] },
                    sort_order: { type: 'string', enum: ['asc', 'desc'] },
                  },
                  required: ['username', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls find_release_in_user_collection tool', async () => {
      const mockItems = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first:
              'https://api.discogs.com/users/testuser/collection/folders/1/releases?page=1&per_page=50',
            last: 'https://api.discogs.com/users/testuser/collection/folders/1/releases?page=1&per_page=50',
          },
        },
        releases: [
          {
            folder_id: 1,
            id: 123,
            instance_id: 456,
            rating: 5,
            basic_information: {
              id: 123,
              title: 'Test Release',
              year: 2024,
              resource_url: 'https://api.discogs.com/releases/123',
              cover_image: 'https://api.discogs.com/releases/123/image',
              thumb: 'https://api.discogs.com/releases/123/thumb',
              artists: [
                {
                  id: 789,
                  name: 'Test Artist',
                  resource_url: 'https://api.discogs.com/artists/789',
                  join: '',
                  role: '',
                  anv: '',
                  tracks: '',
                },
              ],
              labels: [],
              formats: [],
              genres: [],
              styles: [],
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

          vi.spyOn(UserCollectionService.prototype, 'findRelease').mockResolvedValue(mockItems);
          server.addTool(findReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'find_release_in_user_collection',
              arguments: {
                username: 'testuser',
                release_id: 123,
                page: 1,
                per_page: 50,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockItems) }],
          });
        },
      });
    });

    it('handles find_release_in_user_collection DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'findRelease').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(findReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'find_release_in_user_collection',
              arguments: {
                username: 'testuser',
                release_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles find_release_in_user_collection invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(findReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'find_release_in_user_collection',
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

  describe('get_user_collection_custom_fields', () => {
    it('adds get_user_collection_custom_fields tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionCustomFieldsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_collection_custom_fields',
                description:
                  'Retrieve a list of user-defined collection notes fields. These fields are available on every release in the collection.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                  },
                  required: ['username'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_user_collection_custom_fields tool', async () => {
      const mockFields = {
        fields: [
          {
            id: 1,
            name: 'Condition',
            type: 'dropdown',
            position: 1,
            public: true,
            lines: 1,
            options: [
              'Mint',
              'Near Mint',
              'Very Good Plus',
              'Very Good',
              'Good Plus',
              'Good',
              'Fair',
              'Poor',
            ],
          },
          {
            id: 2,
            name: 'Notes',
            type: 'text',
            position: 2,
            public: false,
            lines: 5,
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getCustomFields').mockResolvedValue(
            mockFields,
          );
          server.addTool(getUserCollectionCustomFieldsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_custom_fields',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFields) }],
          });
        },
      });
    });

    it('handles get_user_collection_custom_fields DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getCustomFields').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserCollectionCustomFieldsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_custom_fields',
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

    it('handles get_user_collection_custom_fields invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionCustomFieldsTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_collection_custom_fields',
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

  describe('rate_release_in_user_collection', () => {
    it('adds rate_release_in_user_collection tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(rateReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'rate_release_in_user_collection',
                description:
                  "Rate a release in a user's collection. The folder_id must be non-zero.",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    release_id: { type: 'number', minimum: 1 },
                    instance_id: {
                      type: 'integer',
                      minimum: -9007199254740991,
                      maximum: 9007199254740991,
                    },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                  },
                  required: ['username', 'folder_id', 'release_id', 'instance_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls rate_release_in_user_collection tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'rateRelease').mockResolvedValue(undefined);
          server.addTool(rateReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'rate_release_in_user_collection',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                rating: 5,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Release rated successfully' }],
          });
        },
      });
    });

    it('handles rate_release_in_user_collection DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'rateRelease').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(rateReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'rate_release_in_user_collection',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                rating: 5,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles rate_release_in_user_collection invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(rateReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'rate_release_in_user_collection',
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

  describe('move_release_in_user_collection', () => {
    it('adds move_release_in_user_collection tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(moveReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'move_release_in_user_collection',
                description: "Move a release in a user's collection to another folder",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 1, maximum: 9007199254740991 },
                    release_id: { type: 'number', minimum: 1 },
                    instance_id: {
                      type: 'integer',
                      minimum: -9007199254740991,
                      maximum: 9007199254740991,
                    },
                    destination_folder_id: {
                      type: 'number',
                    },
                  },
                  required: [
                    'username',
                    'folder_id',
                    'release_id',
                    'instance_id',
                    'destination_folder_id',
                  ],
                },
              },
            ],
          });
        },
      });
    });

    it('calls move_release_in_user_collection tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'moveRelease').mockResolvedValue(undefined);
          server.addTool(moveReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'move_release_in_user_collection',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                destination_folder_id: 2,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Release moved successfully' }],
          });
        },
      });
    });

    it('handles move_release_in_user_collection DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'moveRelease').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(moveReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'move_release_in_user_collection',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                destination_folder_id: 2,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles move_release_in_user_collection invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(moveReleaseInUserCollectionTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'move_release_in_user_collection',
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

  describe('get_user_collection_value', () => {
    it('adds get_user_collection_value tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_collection_value',
                description:
                  "Returns the minimum, median, and maximum value of a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                  },
                  required: ['username'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_user_collection_value tool', async () => {
      const mockValue = {
        minimum: '100.00',
        median: '150.00',
        maximum: '200.00',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getValue').mockResolvedValue(mockValue);
          server.addTool(getUserCollectionValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_value',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockValue) }],
          });
        },
      });
    });

    it('handles get_user_collection_value DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'getValue').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserCollectionValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_collection_value',
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

    it('handles get_user_collection_value invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserCollectionValueTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_collection_value',
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

  describe('edit_user_collection_custom_field_value', () => {
    it('adds edit_user_collection_custom_field_value tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editUserCollectionCustomFieldValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'edit_user_collection_custom_field_value',
                description: "Edit a custom field value for a release in a user's collection",
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    folder_id: { type: 'integer', minimum: 0, maximum: 9007199254740991 },
                    release_id: { anyOf: [{ type: 'number' }, { type: 'string' }] },
                    instance_id: { anyOf: [{ type: 'number' }, { type: 'string' }] },
                    field_id: { type: 'number' },
                    value: { type: 'string' },
                  },
                  required: [
                    'username',
                    'folder_id',
                    'value',
                    'release_id',
                    'instance_id',
                    'field_id',
                  ],
                },
              },
            ],
          });
        },
      });
    });

    it('calls edit_user_collection_custom_field_value tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'editCustomFieldValue').mockResolvedValue(
            undefined,
          );
          server.addTool(editUserCollectionCustomFieldValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_collection_custom_field_value',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                field_id: 1,
                value: 'Mint',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Custom field value edited successfully' }],
          });
        },
      });
    });

    it('handles edit_user_collection_custom_field_value DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'editCustomFieldValue').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(editUserCollectionCustomFieldValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_collection_custom_field_value',
              arguments: {
                username: 'testuser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                field_id: 1,
                value: 'Mint',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles edit_user_collection_custom_field_value invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editUserCollectionCustomFieldValueTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'edit_user_collection_custom_field_value',
              arguments: {},
            });
          } catch (error) {
            expect(error).toBeInstanceOf(McpError);
            expect(error.code).toBe(ErrorCode.InvalidParams);
          }
        },
      });
    });

    it('handles edit_user_collection_custom_field_value validation errors', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'editCustomFieldValue').mockRejectedValue(
            formatDiscogsError('Validation failed'),
          );

          server.addTool(editUserCollectionCustomFieldValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_collection_custom_field_value',
              arguments: {
                username: 'testuser',
                folder_id: 0,
                release_id: 123,
                instance_id: 456,
                field_id: 1,
                value: 'Mint',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Validation failed' }],
            isError: true,
          });
        },
      });
    });

    it('handles edit_user_collection_custom_field_value permission errors', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserCollectionService.prototype, 'editCustomFieldValue').mockRejectedValue(
            formatDiscogsError('Permission denied'),
          );

          server.addTool(editUserCollectionCustomFieldValueTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_collection_custom_field_value',
              arguments: {
                username: 'otheruser',
                folder_id: 1,
                release_id: 123,
                instance_id: 456,
                field_id: 1,
                value: 'Mint',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Permission denied' }],
            isError: true,
          });
        },
      });
    });
  });
});
