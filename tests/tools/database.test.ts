import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP, UserError } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { ArtistService } from '../../src/services/artist';
import { DatabaseService } from '../../src/services/database';
import { LabelService } from '../../src/services/label';
import { MasterReleaseService } from '../../src/services/master';
import { ReleaseService } from '../../src/services/release';
import {
  deleteReleaseRatingTool,
  editReleaseRatingTool,
  getArtistReleasesTool,
  getArtistTool,
  getLabelReleasesTool,
  getLabelTool,
  getMasterReleaseTool,
  getReleaseCommunityRatingTool,
  getReleaseRatingTool,
  getReleaseTool,
  searchTool,
} from '../../src/tools/database';
import { CurrencyCodeSchema } from '../../src/types/common';
import { runWithTestServer } from '../utils/testServer';

describe('Database Tools', () => {
  describe('get_release', () => {
    it('adds get_release tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_release',
                description: 'Get a release',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    release_id: { type: 'number', minimum: 1 },
                    curr_abbr: {
                      type: 'string',
                      enum: CurrencyCodeSchema.options,
                    },
                  },
                  required: ['release_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_release tool', async () => {
      const mockRelease = {
        id: 123,
        title: 'Test Release',
        artists: [
          {
            id: 456,
            name: 'Test Artist',
            join: ',',
            role: 'Main',
            anv: '',
            resource_url: 'https://api.discogs.com/artists/456',
            tracks: '',
          },
        ],
        labels: [
          {
            id: 789,
            name: 'Test Label',
            resource_url: 'https://api.discogs.com/labels/789',
            catno: 'TEST001',
          },
        ],
        year: 2024,
        resource_url: 'https://api.discogs.com/releases/123',
        uri: 'https://www.discogs.com/release/123',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'get').mockResolvedValue(mockRelease);
          server.addTool(getReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_release',
              arguments: {
                release_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockRelease) }],
          });
        },
      });
    });

    it('handles get_release DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          // Mock the service to throw a UserError
          vi.spyOn(ReleaseService.prototype, 'get').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_release',
              arguments: {
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

    it('handles get_release invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_release',
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

  describe('get_release_rating_by_user', () => {
    it('adds get_release_rating_by_user tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_release_rating_by_user',
                description: `Retrieves the release's rating for a given user`,
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    release_id: { type: 'number', minimum: 1 },
                    username: { type: 'string', minLength: 1 },
                  },
                  required: ['username', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_release_rating_by_user tool', async () => {
      const mockRating = {
        release_id: 123,
        username: 'testuser',
        rating: 5,
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'getRatingByUser').mockResolvedValue(mockRating);
          server.addTool(getReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_release_rating_by_user',
              arguments: {
                release_id: 123,
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockRating) }],
          });
        },
      });
    });

    it('handles get_release_rating_by_user DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'getRatingByUser').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_release_rating_by_user',
              arguments: {
                release_id: 123,
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

    it('handles get_release_rating_by_user invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_release_rating_by_user',
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

  describe('edit_release_rating', () => {
    it('adds edit_release_rating tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'edit_release_rating',
                description: `Updates the release's rating for a given user`,
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    release_id: { type: 'number', minimum: 1 },
                    username: { type: 'string', minLength: 1 },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                  },
                  required: ['username', 'release_id', 'rating'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls edit_release_rating tool', async () => {
      const mockRating = {
        release_id: 123,
        username: 'testuser',
        rating: 5,
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'editRatingByUser').mockResolvedValue(mockRating);
          server.addTool(editReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_release_rating',
              arguments: {
                release_id: 123,
                username: 'testuser',
                rating: 5,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockRating) }],
          });
        },
      });
    });

    it('handles edit_release_rating DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'editRatingByUser').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(editReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_release_rating',
              arguments: {
                release_id: 123,
                username: 'testuser',
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

    it('handles edit_release_rating invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'edit_release_rating',
              arguments: {},
            });
          } catch (error) {
            expect(error).toBeInstanceOf(McpError);
            expect(error.code).toBe(ErrorCode.InvalidParams);
          }

          try {
            await client.callTool({
              name: 'edit_release_rating',
              arguments: {
                release_id: 123,
                username: 'testuser',
                rating: 6,
              },
            });
          } catch (error) {
            expect(error).toBeInstanceOf(McpError);
            expect(error.code).toBe(ErrorCode.InvalidParams);
          }
        },
      });
    });
  });

  describe('delete_release_rating', () => {
    it('adds delete_release_rating tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'delete_release_rating',
                description: `Deletes the release's rating for a given user`,
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    release_id: { type: 'number', minimum: 1 },
                    username: { type: 'string', minLength: 1 },
                  },
                  required: ['username', 'release_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls delete_release_rating tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'deleteRatingByUser').mockResolvedValue(undefined);
          server.addTool(deleteReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_release_rating',
              arguments: {
                release_id: 123,
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Release rating deleted successfully' }],
          });
        },
      });
    });

    it('handles delete_release_rating DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'deleteRatingByUser').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(deleteReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_release_rating',
              arguments: {
                release_id: 123,
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

    it('handles delete_release_rating invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteReleaseRatingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'delete_release_rating',
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

  describe('get_release_community_rating', () => {
    it('adds get_release_community_rating tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getReleaseCommunityRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_release_community_rating',
                description: 'Retrieves the release community rating average and count',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    release_id: { type: 'number', minimum: 1 },
                  },
                  required: ['release_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_release_community_rating tool', async () => {
      const mockRating = {
        release_id: 123,
        rating: {
          average: 4.5,
          count: 100,
        },
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'getCommunityRating').mockResolvedValue(mockRating);
          server.addTool(getReleaseCommunityRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_release_community_rating',
              arguments: {
                release_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockRating) }],
          });
        },
      });
    });

    it('handles get_release_community_rating DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ReleaseService.prototype, 'getCommunityRating').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getReleaseCommunityRatingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_release_community_rating',
              arguments: {
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

    it('handles get_release_community_rating invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getReleaseCommunityRatingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_release_community_rating',
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

  describe('get_master_release', () => {
    it('adds get_master_release tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getMasterReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_master_release',
                description: 'Get a master release',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    master_id: { type: 'integer' },
                  },
                  required: ['master_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_master_release tool', async () => {
      const mockMasterRelease = {
        id: 123,
        title: 'Test Master Release',
        artists: [
          {
            id: 456,
            name: 'Test Artist',
            join: ',',
            role: 'Main',
            anv: '',
            resource_url: 'https://api.discogs.com/artists/456',
            tracks: '',
            thumbnail_url: 'https://api.discogs.com/artists/456/thumb.jpg',
          },
        ],
        year: 2024,
        resource_url: 'https://api.discogs.com/masters/123',
        uri: 'https://www.discogs.com/master/123',
        main_release: 123,
        most_recent_release: 123,
        versions_url: 'https://api.discogs.com/masters/123/versions',
        main_release_url: 'https://api.discogs.com/releases/123',
        most_recent_release_url: 'https://api.discogs.com/releases/123',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MasterReleaseService.prototype, 'get').mockResolvedValue(mockMasterRelease);
          server.addTool(getMasterReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_master_release',
              arguments: {
                master_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockMasterRelease) }],
          });
        },
      });
    });

    it('handles get_master_release DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MasterReleaseService.prototype, 'get').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getMasterReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_master_release',
              arguments: {
                master_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_master_release invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getMasterReleaseTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_master_release',
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

  describe('get_artist', () => {
    it('adds get_artist tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getArtistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_artist',
                description: 'Get an artist',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    artist_id: { type: 'number' },
                  },
                  required: ['artist_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_artist tool', async () => {
      const mockArtist = {
        id: 123,
        name: 'Test Artist',
        profile: 'Test profile',
        resource_url: 'https://api.discogs.com/artists/123',
        uri: 'https://www.discogs.com/artist/123',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ArtistService.prototype, 'get').mockResolvedValue(mockArtist);
          server.addTool(getArtistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_artist',
              arguments: {
                artist_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockArtist) }],
          });
        },
      });
    });

    it('handles get_artist DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ArtistService.prototype, 'get').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getArtistTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_artist',
              arguments: {
                artist_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_artist invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getArtistTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_artist',
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

  describe('get_artist_releases', () => {
    it('adds get_artist_releases tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getArtistReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_artist_releases',
                description: `Get an artist's releases`,
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    artist_id: { type: 'number' },
                    page: { type: 'integer', minimum: 1 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: {
                      type: 'string',
                      enum: ['year', 'title', 'format'],
                    },
                    sort_order: {
                      type: 'string',
                      enum: ['asc', 'desc'],
                    },
                  },
                  required: ['artist_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_artist_releases tool', async () => {
      const mockReleases = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first: 'https://api.discogs.com/artists/123/releases?page=1',
            prev: undefined,
            next: undefined,
            last: 'https://api.discogs.com/artists/123/releases?page=1',
          },
        },
        releases: [
          {
            id: 123,
            title: 'Test Release',
            year: 2024,
            resource_url: 'https://api.discogs.com/releases/123',
            uri: 'https://www.discogs.com/release/123',
            artist: 'Test Artist',
            type: 'release',
            status: 'Accepted',
            role: 'Main',
            catno: 'TEST001',
            thumb: 'https://api.discogs.com/releases/123/thumb.jpg',
            trackinfo: 'A1 Test Track',
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ArtistService.prototype, 'getReleases').mockResolvedValue(mockReleases);
          server.addTool(getArtistReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_artist_releases',
              arguments: {
                artist_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockReleases) }],
          });
        },
      });
    });

    it('handles get_artist_releases DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(ArtistService.prototype, 'getReleases').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getArtistReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_artist_releases',
              arguments: {
                artist_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_artist_releases invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getArtistReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_artist_releases',
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

  describe('get_label', () => {
    it('adds get_label tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getLabelTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_label',
                description: 'Get a label',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    label_id: { type: 'number' },
                  },
                  required: ['label_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_label tool', async () => {
      const mockLabel = {
        id: 123,
        name: 'Test Label',
        profile: 'Test profile',
        resource_url: 'https://api.discogs.com/labels/123',
        uri: 'https://www.discogs.com/label/123',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(LabelService.prototype, 'get').mockResolvedValue(mockLabel);
          server.addTool(getLabelTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_label',
              arguments: {
                label_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockLabel) }],
          });
        },
      });
    });

    it('handles get_label DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(LabelService.prototype, 'get').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getLabelTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_label',
              arguments: {
                label_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_label invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getLabelTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_label',
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

  describe('get_label_releases', () => {
    it('adds get_label_releases tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getLabelReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_label_releases',
                description: 'Returns a list of Releases associated with the label',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    label_id: { type: 'number' },
                    page: { type: 'integer', minimum: 1 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: {
                      type: 'string',
                      enum: [],
                    },
                    sort_order: {
                      type: 'string',
                      enum: ['asc', 'desc'],
                    },
                  },
                  required: ['label_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_label_releases tool', async () => {
      const mockReleases = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first: 'https://api.discogs.com/labels/123/releases?page=1',
            prev: undefined,
            next: undefined,
            last: 'https://api.discogs.com/labels/123/releases?page=1',
          },
        },
        releases: [
          {
            id: 123,
            title: 'Test Release',
            year: 2024,
            resource_url: 'https://api.discogs.com/releases/123',
            uri: 'https://www.discogs.com/release/123',
            artist: 'Test Artist',
            type: 'release',
            status: 'Accepted',
            role: 'Main',
            catno: 'TEST001',
            thumb: 'https://api.discogs.com/releases/123/thumb.jpg',
            trackinfo: 'A1 Test Track',
          },
        ],
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(LabelService.prototype, 'getReleases').mockResolvedValue(mockReleases);
          server.addTool(getLabelReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_label_releases',
              arguments: {
                label_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockReleases) }],
          });
        },
      });
    });

    it('handles get_label_releases DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(LabelService.prototype, 'getReleases').mockRejectedValue(
            new UserError('Resource not found'),
          );

          server.addTool(getLabelReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_label_releases',
              arguments: {
                label_id: 123,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_label_releases invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getLabelReleasesTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_label_releases',
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

  describe('search', () => {
    it('adds search tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(searchTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'search',
                description: 'Issue a search query to the Discogs database',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    q: { type: 'string' },
                    type: {
                      type: 'string',
                      enum: ['artist', 'label', 'master', 'release'],
                    },
                    title: { type: 'string' },
                    release_title: { type: 'string' },
                    credit: { type: 'string' },
                    artist: { type: 'string' },
                    anv: { type: 'string' },
                    label: { type: 'string' },
                    genre: { type: 'string' },
                    style: { type: 'string' },
                    country: { type: 'string' },
                    year: { type: 'string' },
                    format: { type: 'string' },
                    catno: { type: 'string' },
                    barcode: { type: 'string' },
                    track: { type: 'string' },
                    submitter: { type: 'string' },
                    contributor: { type: 'string' },
                    page: { type: 'integer', minimum: 1 },
                    per_page: { type: 'integer', minimum: 1, maximum: 100 },
                    sort: {
                      type: 'string',
                      enum: ['title', 'artist', 'year'],
                    },
                    sort_order: {
                      type: 'string',
                      enum: ['asc', 'desc'],
                    },
                  },
                },
              },
            ],
          });
        },
      });
    });

    it('calls search tool', async () => {
      const mockResults = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first: 'https://api.discogs.com/database/search?q=test&page=1',
            prev: undefined,
            next: undefined,
            last: 'https://api.discogs.com/database/search?q=test&page=1',
          },
        },
        results: [
          {
            id: 123,
            type: 'release' as const,
            title: 'Test Release',
            year: '2024',
            resource_url: 'https://api.discogs.com/releases/123',
            uri: 'https://www.discogs.com/release/123',
            catno: 'TEST001',
            community: {
              have: 100,
              want: 50,
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

          vi.spyOn(DatabaseService.prototype, 'search').mockResolvedValue(mockResults);
          server.addTool(searchTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'search',
              arguments: {
                q: 'test',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockResults) }],
          });
        },
      });
    });
  });
});
