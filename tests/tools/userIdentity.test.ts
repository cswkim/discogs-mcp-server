import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors';
import { OAuthService } from '../../src/services/oauth';
import { UserSubmissionsService } from '../../src/services/user/contribution';
import { UserProfileService } from '../../src/services/user/profile';
import {
  editUserProfileTool,
  getUserIdentityTool,
  getUserProfileTool,
  getUserSubmissionsTool,
} from '../../src/tools/userIdentity';
import { runWithTestServer } from '../utils/testServer';

describe('User Identity Tools', () => {
  describe('get_user_identity', () => {
    it('adds get_user_identity tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserIdentityTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_identity',
                description: 'Retrieve basic information about the authenticated user',
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

    it('calls get_user_identity tool', async () => {
      const mockIdentity = {
        id: 123,
        username: 'testuser',
        resource_url: 'https://api.discogs.com/users/testuser',
        consumer_name: 'Test App',
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(OAuthService.prototype, 'getUserIdentity').mockResolvedValue(mockIdentity);
          server.addTool(getUserIdentityTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_identity',
              arguments: {},
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockIdentity) }],
          });
        },
      });
    });

    it('handles get_user_identity DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(OAuthService.prototype, 'getUserIdentity').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserIdentityTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_identity',
              arguments: {},
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_user_identity invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserIdentityTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_identity',
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

  describe('get_user_profile', () => {
    it('adds get_user_profile tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_profile',
                description: 'Retrieve a user by username',
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

    it('calls get_user_profile tool', async () => {
      const mockProfile = {
        id: 123,
        username: 'testuser',
        name: 'Test User',
        profile: 'Test profile',
        location: 'Test Location',
        resource_url: 'https://api.discogs.com/users/testuser',
        uri: 'https://www.discogs.com/users/testuser',
        home_page: '',
        registered: '2024-01-01T00:00:00Z',
        rank: 1,
        num_pending: 0,
        num_for_sale: 0,
        num_lists: 0,
        releases_contributed: 0,
        releases_rated: 0,
        rating_avg: 0,
        inventory_url: 'https://api.discogs.com/users/testuser/inventory',
        collection_folders_url: 'https://api.discogs.com/users/testuser/collection/folders',
        collection_fields_url: 'https://api.discogs.com/users/testuser/collection/fields',
        wantlist_url: 'https://api.discogs.com/users/testuser/wants',
        avatar_url: 'https://example.com/avatar.jpg',
        curr_abbr: 'USD',
        activated: true,
        marketplace_suspended: false,
        banner_url: 'https://example.com/banner.jpg',
        buyer_rating: 0,
        buyer_rating_stars: 0,
        buyer_num_ratings: 0,
        seller_rating: 0,
        seller_rating_stars: 0,
        seller_num_ratings: 0,
        is_staff: false,
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserProfileService.prototype, 'get').mockResolvedValue(mockProfile);
          server.addTool(getUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_profile',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockProfile) }],
          });
        },
      });
    });

    it('handles get_user_profile DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserProfileService.prototype, 'get').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_profile',
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

    it('handles get_user_profile invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_profile',
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

  describe('edit_user_profile', () => {
    it('adds edit_user_profile tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'edit_user_profile',
                description: "Edit a user's profile data",
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    username: { type: 'string', minLength: 1 },
                    name: { type: 'string' },
                    profile: { type: 'string' },
                    location: { type: 'string' },
                    home_page: { type: 'string' },
                    curr_abbr: {
                      type: 'string',
                      enum: [
                        'USD',
                        'GBP',
                        'EUR',
                        'CAD',
                        'AUD',
                        'JPY',
                        'CHF',
                        'MXN',
                        'BRL',
                        'NZD',
                        'SEK',
                        'ZAR',
                      ],
                    },
                  },
                  required: ['username'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls edit_user_profile tool', async () => {
      const mockUpdatedProfile = {
        id: 123,
        username: 'testuser',
        name: 'Updated Name',
        profile: 'Updated profile',
        location: 'Updated Location',
        resource_url: 'https://api.discogs.com/users/testuser',
        uri: 'https://www.discogs.com/users/testuser',
        home_page: '',
        registered: '2024-01-01T00:00:00Z',
        rank: 1,
        num_pending: 0,
        num_for_sale: 0,
        num_lists: 0,
        releases_contributed: 0,
        releases_rated: 0,
        rating_avg: 0,
        inventory_url: 'https://api.discogs.com/users/testuser/inventory',
        collection_folders_url: 'https://api.discogs.com/users/testuser/collection/folders',
        collection_fields_url: 'https://api.discogs.com/users/testuser/collection/fields',
        wantlist_url: 'https://api.discogs.com/users/testuser/wants',
        avatar_url: 'https://example.com/avatar.jpg',
        curr_abbr: 'USD',
        activated: true,
        marketplace_suspended: false,
        banner_url: 'https://example.com/banner.jpg',
        buyer_rating: 0,
        buyer_rating_stars: 0,
        buyer_num_ratings: 0,
        seller_rating: 0,
        seller_rating_stars: 0,
        seller_num_ratings: 0,
        is_staff: false,
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserProfileService.prototype, 'edit').mockResolvedValue(mockUpdatedProfile);
          server.addTool(editUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_profile',
              arguments: {
                username: 'testuser',
                name: 'Updated Name',
                profile: 'Updated profile',
                location: 'Updated Location',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockUpdatedProfile) }],
          });
        },
      });
    });

    it('handles edit_user_profile DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserProfileService.prototype, 'edit').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(editUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'edit_user_profile',
              arguments: {
                username: 'testuser',
                name: 'Updated Name',
                profile: 'Updated profile',
                location: 'Updated Location',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles edit_user_profile invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(editUserProfileTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'edit_user_profile',
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

  describe('get_user_submissions', () => {
    it('adds get_user_submissions tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserSubmissionsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_user_submissions',
                description: `Retrieve a user's submissions by username`,
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

    it('calls get_user_submissions tool', async () => {
      const mockSubmissions = {
        pagination: {
          page: 1,
          per_page: 50,
          pages: 1,
          items: 1,
          urls: {},
        },
        submissions: {
          artists: [],
          labels: [],
          releases: [],
        },
      };

      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserSubmissionsService.prototype, 'get').mockResolvedValue(mockSubmissions);
          server.addTool(getUserSubmissionsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_submissions',
              arguments: {
                username: 'testuser',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockSubmissions) }],
          });
        },
      });
    });

    it('handles get_user_submissions DiscogsResourceNotFoundError', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(UserSubmissionsService.prototype, 'get').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getUserSubmissionsTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_user_submissions',
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

    it('handles get_user_submissions invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getUserSubmissionsTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_user_submissions',
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
