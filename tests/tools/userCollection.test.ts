import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { UserCollectionService } from '../../src/services/user/collection.js';
import {
  addReleaseToUserCollectionFolderTool,
  createUserCollectionFolderTool,
  deleteReleaseFromUserCollectionFolderTool,
  deleteUserCollectionFolderTool,
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
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
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
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
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
  });

  describe('get_user_collection_folder', () => {
    it('should return a specific collection folder', async () => {
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
          const result = await client.callTool({
            name: 'get_user_collection_folder',
            arguments: {
              username: 'testuser',
              folder_id: 1,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFolder) }],
          });
        },
      });
    });
  });

  describe('edit_user_collection_folder', () => {
    it('should edit a collection folder', async () => {
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
          const result = await client.callTool({
            name: 'edit_user_collection_folder',
            arguments: {
              username: 'testuser',
              folder_id: 1,
              name: 'Updated Folder',
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFolder) }],
          });
        },
      });
    });
  });

  describe('delete_user_collection_folder', () => {
    it('should delete a collection folder', async () => {
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
          const result = await client.callTool({
            name: 'delete_user_collection_folder',
            arguments: {
              username: 'testuser',
              folder_id: 1,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: 'Folder deleted successfully' }],
          });
        },
      });
    });
  });

  describe('get_user_collection_items', () => {
    it('should return items in a collection folder', async () => {
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
          const result = await client.callTool({
            name: 'get_user_collection_items',
            arguments: {
              username: 'testuser',
              folder_id: 1,
              page: 1,
              per_page: 50,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockItems) }],
          });
        },
      });
    });
  });

  describe('add_release_to_user_collection_folder', () => {
    it('should add a release to a collection folder', async () => {
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
          const result = await client.callTool({
            name: 'add_release_to_user_collection_folder',
            arguments: {
              username: 'testuser',
              folder_id: 1,
              release_id: 123,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockAdded) }],
          });
        },
      });
    });
  });

  describe('delete_release_from_user_collection_folder', () => {
    it('should delete a release from a collection folder', async () => {
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
          const result = await client.callTool({
            name: 'delete_release_from_user_collection_folder',
            arguments: {
              username: 'testuser',
              folder_id: 1,
              release_id: 123,
              instance_id: 456,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: 'Release deleted successfully' }],
          });
        },
      });
    });
  });

  describe('find_release_in_user_collection', () => {
    it('should find a release in a collection', async () => {
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
          const result = await client.callTool({
            name: 'find_release_in_user_collection',
            arguments: {
              username: 'testuser',
              release_id: 123,
              page: 1,
              per_page: 50,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockItems) }],
          });
        },
      });
    });
  });

  describe('get_user_collection_custom_fields', () => {
    it('should return custom fields for a collection', async () => {
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
          const result = await client.callTool({
            name: 'get_user_collection_custom_fields',
            arguments: {
              username: 'testuser',
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockFields) }],
          });
        },
      });
    });
  });

  describe('rate_release_in_user_collection', () => {
    it('should rate a release in a collection', async () => {
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
          const result = await client.callTool({
            name: 'rate_release_in_user_collection',
            arguments: {
              username: 'testuser',
              folder_id: 1,
              release_id: 123,
              instance_id: 456,
              rating: 5,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: 'Release rated successfully' }],
          });
        },
      });
    });
  });

  describe('move_release_in_user_collection', () => {
    it('should move a release to a different folder', async () => {
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
          const result = await client.callTool({
            name: 'move_release_in_user_collection',
            arguments: {
              username: 'testuser',
              folder_id: 1,
              release_id: 123,
              instance_id: 456,
              destination_folder_id: 2,
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: 'Release moved successfully' }],
          });
        },
      });
    });
  });

  describe('get_user_collection_value', () => {
    it('should return the value of a collection', async () => {
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
          const result = await client.callTool({
            name: 'get_user_collection_value',
            arguments: {
              username: 'testuser',
            },
          });

          expect(result).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockValue) }],
          });
        },
      });
    });
  });
});
