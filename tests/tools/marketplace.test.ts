import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors.js';
import { MarketplaceService } from '../../src/services/marketplace.js';
import {
  createMarketplaceListingTool,
  deleteMarketplaceListingTool,
  getMarketplaceListingTool,
  getMarketplaceOrderTool,
  updateMarketplaceListingTool,
} from '../../src/tools/marketplace.js';
import { CurrencyCodeSchema } from '../../src/types/common.js';
import { runWithTestServer } from '../utils/testServer.js';

const mockListing = {
  id: 123,
  resource_url: 'https://api.discogs.com/marketplace/listings/123',
  uri: 'https://www.discogs.com/sell/item/123',
  status: 'For Sale' as const,
  condition: 'Very Good (VG)',
  sleeve_condition: 'Very Good (VG)',
  comments: 'Test comments',
  ships_from: 'United States',
  posted: '2024-04-15T18:43:39-07:00',
  allow_offers: true,
  offer_submitted: false,
  audio: false,
  price: {
    currency: 'USD' as const,
    value: 19.99,
  },
  original_price: {
    curr_abbr: 'USD' as const,
    curr_id: 1,
    formatted: '$19.99',
    value: 19.99,
  },
  shipping_price: {
    currency: 'USD' as const,
    value: 5.0,
  },
  original_shipping_price: {
    curr_abbr: 'USD' as const,
    curr_id: 1,
    formatted: '$5.00',
    value: 5.0,
  },
  seller: {
    id: 12345,
    username: 'TestSeller',
    avatar_url: 'https://i.discogs.com/avatar.jpg',
    stats: {
      rating: '100.0',
      stars: 5,
      total: 100,
    },
    min_order_total: 0,
    html_url: 'https://www.discogs.com/user/TestSeller',
    uid: 12345,
    url: 'https://api.discogs.com/users/TestSeller',
    payment: 'PayPal',
    shipping: 'Test shipping policy',
    resource_url: 'https://api.discogs.com/users/TestSeller',
  },
  release: {
    catalog_number: 'ABC123',
    resource_url: 'https://api.discogs.com/releases/12345',
    year: 2020,
    id: 12345,
    description: 'Test Release - LP, Album',
    images: [
      {
        type: 'primary',
        uri: 'https://i.discogs.com/test.jpg',
        resource_url: 'https://i.discogs.com/test.jpg',
        uri150: 'https://i.discogs.com/test-150.jpg',
        width: 500,
        height: 500,
      },
    ],
    artist: 'Test Artist',
    title: 'Test Album',
    format: 'LP, Album',
    thumbnail: 'https://i.discogs.com/thumb.jpg',
    stats: {
      community: {
        in_wantlist: 10,
        in_collection: 50,
      },
    },
  },
};

const mockListingNewResponse = {
  listing_id: 123,
  resource_url: 'https://api.discogs.com/marketplace/listings/123',
};

describe('Marketplace Tools', () => {
  describe('create_marketplace_listing', () => {
    it('adds create_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(createMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'create_marketplace_listing',
                description: 'Create a new marketplace listing',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    release_id: { type: 'integer' },
                    condition: {
                      type: 'string',
                      enum: [
                        'Mint (M)',
                        'Near Mint (NM or M-)',
                        'Very Good Plus (VG+)',
                        'Very Good (VG)',
                        'Good Plus (G+)',
                        'Good (G)',
                        'Fair (F)',
                        'Poor (P)',
                      ],
                    },
                    sleeve_condition: {
                      type: 'string',
                      enum: [
                        'Mint (M)',
                        'Near Mint (NM or M-)',
                        'Very Good Plus (VG+)',
                        'Very Good (VG)',
                        'Good Plus (G+)',
                        'Good (G)',
                        'Fair (F)',
                        'Poor (P)',
                        'Generic',
                        'Not Graded',
                        'No Cover',
                      ],
                    },
                    price: { type: 'number' },
                    status: {
                      type: 'string',
                      enum: ['For Sale', 'Expired', 'Draft'],
                    },
                    format_quantity: { type: 'number' },
                    comments: { type: 'string' },
                    allow_offers: { type: 'boolean' },
                    external_id: { type: 'string' },
                    location: { type: 'string' },
                    weight: { type: 'number' },
                  },
                  required: ['release_id', 'condition', 'price', 'status'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls create_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MarketplaceService.prototype, 'createListing').mockResolvedValue(
            mockListingNewResponse,
          );
          server.addTool(createMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'create_marketplace_listing',
              arguments: {
                release_id: 123,
                condition: 'Very Good (VG)',
                price: 19.99,
                status: 'For Sale',
                format_quantity: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockListingNewResponse) }],
          });
        },
      });
    });

    it('handles create_marketplace_listing not found', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({ name: 'Test', version: '1.0.0' });

          vi.spyOn(MarketplaceService.prototype, 'createListing').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(createMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'create_marketplace_listing',
              arguments: {
                release_id: 123,
                condition: 'Very Good (VG)',
                price: 19.99,
                status: 'For Sale',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles create_marketplace_listing invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(createMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'create_marketplace_listing',
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

  describe('get_marketplace_listing', () => {
    it('adds get_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_marketplace_listing',
                description: 'Get a listing from the marketplace',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    listing_id: { type: 'integer' },
                    curr_abbr: {
                      type: 'string',
                      enum: CurrencyCodeSchema.options,
                    },
                  },
                  required: ['listing_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MarketplaceService.prototype, 'getListing').mockResolvedValue(mockListing);
          server.addTool(getMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_marketplace_listing',
              arguments: { listing_id: 123, curr_abbr: 'USD' },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockListing) }],
          });
        },
      });
    });

    it('handles get_marketplace_listing not found', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({ name: 'Test', version: '1.0.0' });

          vi.spyOn(MarketplaceService.prototype, 'getListing').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_marketplace_listing',
              arguments: { listing_id: 123, curr_abbr: 'USD' },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_marketplace_listing invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_marketplace_listing',
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

  describe('delete_marketplace_listing', () => {
    it('adds delete_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'delete_marketplace_listing',
                description: 'Delete a marketplace listing',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    listing_id: { type: 'integer' },
                  },
                  required: ['listing_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls delete_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MarketplaceService.prototype, 'deleteListing').mockResolvedValue(undefined);
          server.addTool(deleteMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_marketplace_listing',
              arguments: { listing_id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Listing deleted successfully' }],
          });
        },
      });
    });

    it('handles delete_marketplace_listing not found', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({ name: 'Test', version: '1.0.0' });

          vi.spyOn(MarketplaceService.prototype, 'deleteListing').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(deleteMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'delete_marketplace_listing',
              arguments: { listing_id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles delete_marketplace_listing invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(deleteMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'delete_marketplace_listing',
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

  describe('update_marketplace_listing', () => {
    it('adds update_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(updateMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'update_marketplace_listing',
                description: 'Update a marketplace listing',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    listing_id: { type: 'integer' },
                    release_id: { type: 'integer' },
                    condition: {
                      type: 'string',
                      enum: [
                        'Mint (M)',
                        'Near Mint (NM or M-)',
                        'Very Good Plus (VG+)',
                        'Very Good (VG)',
                        'Good Plus (G+)',
                        'Good (G)',
                        'Fair (F)',
                        'Poor (P)',
                      ],
                    },
                    sleeve_condition: {
                      type: 'string',
                      enum: [
                        'Mint (M)',
                        'Near Mint (NM or M-)',
                        'Very Good Plus (VG+)',
                        'Very Good (VG)',
                        'Good Plus (G+)',
                        'Good (G)',
                        'Fair (F)',
                        'Poor (P)',
                        'Generic',
                        'Not Graded',
                        'No Cover',
                      ],
                    },
                    price: { type: 'number' },
                    status: {
                      type: 'string',
                      enum: ['For Sale', 'Expired', 'Draft'],
                    },
                    format_quantity: { type: 'number' },
                    comments: { type: 'string' },
                    allow_offers: { type: 'boolean' },
                    external_id: { type: 'string' },
                    location: { type: 'string' },
                    weight: { type: 'number' },
                  },
                  required: ['listing_id', 'release_id', 'condition', 'price', 'status'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls update_marketplace_listing tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MarketplaceService.prototype, 'updateListing').mockResolvedValue(undefined);
          server.addTool(updateMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'update_marketplace_listing',
              arguments: {
                listing_id: 123,
                release_id: 123,
                condition: 'Very Good (VG)',
                price: 19.99,
                status: 'For Sale',
                format_quantity: 1,
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Listing updated successfully' }],
          });
        },
      });
    });

    it('handles update_marketplace_listing not found', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({ name: 'Test', version: '1.0.0' });

          vi.spyOn(MarketplaceService.prototype, 'updateListing').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(updateMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'update_marketplace_listing',
              arguments: {
                listing_id: 123,
                release_id: 123,
                condition: 'Very Good (VG)',
                price: 19.99,
                status: 'For Sale',
              },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles update_marketplace_listing invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(updateMarketplaceListingTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'update_marketplace_listing',
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

  describe('get_marketplace_order', () => {
    const mockOrder = {
      id: 123,
      resource_url: 'https://api.discogs.com/marketplace/orders/123',
      messages_url: 'https://api.discogs.com/marketplace/orders/123/messages',
      uri: 'https://www.discogs.com/sell/order/123',
      status: 'New Order' as const,
      next_status: ['Buyer Contacted' as const, 'Invoice Sent' as const],
      fee: {
        currency: 'USD' as const,
        value: 1.99,
      },
      created: '2024-04-15T18:43:39-07:00',
      items: [
        {
          release: {
            id: 12345,
            description: 'Test Release - LP, Album',
          },
          price: {
            currency: 'USD' as const,
            value: 19.99,
          },
          media_condition: 'Very Good (VG)' as const,
          sleeve_condition: 'Very Good (VG)' as const,
          id: 1,
        },
      ],
      shipping: {
        currency: 'USD' as const,
        method: 'Standard',
        value: 5.0,
      },
      shipping_address: '123 Test St, Test City, Test Country',
      address_instructions: 'Leave at front door',
      archived: false,
      seller: {
        id: 12345,
        username: 'TestSeller',
        resource_url: 'https://api.discogs.com/users/TestSeller',
      },
      last_activity: '2024-04-15T18:43:39-07:00',
      buyer: {
        id: 67890,
        username: 'TestBuyer',
        resource_url: 'https://api.discogs.com/users/TestBuyer',
      },
      total: {
        currency: 'USD' as const,
        value: 26.98,
      },
    };

    it('adds get_marketplace_order tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getMarketplaceOrderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(await client.listTools()).toEqual({
            tools: [
              {
                name: 'get_marketplace_order',
                description: 'Get a marketplace order',
                inputSchema: {
                  additionalProperties: false,
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  type: 'object',
                  properties: {
                    order_id: { type: 'number' },
                  },
                  required: ['order_id'],
                },
              },
            ],
          });
        },
      });
    });

    it('calls get_marketplace_order tool', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          vi.spyOn(MarketplaceService.prototype, 'getOrder').mockResolvedValue(mockOrder);
          server.addTool(getMarketplaceOrderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_marketplace_order',
              arguments: { order_id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: JSON.stringify(mockOrder) }],
          });
        },
      });
    });

    it('handles get_marketplace_order not found', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({ name: 'Test', version: '1.0.0' });

          vi.spyOn(MarketplaceService.prototype, 'getOrder').mockRejectedValue(
            formatDiscogsError('Resource not found'),
          );

          server.addTool(getMarketplaceOrderTool);
          return server;
        },
        run: async ({ client }) => {
          expect(
            await client.callTool({
              name: 'get_marketplace_order',
              arguments: { order_id: 123 },
            }),
          ).toEqual({
            content: [{ type: 'text', text: 'Resource not found' }],
            isError: true,
          });
        },
      });
    });

    it('handles get_marketplace_order invalid parameters', async () => {
      await runWithTestServer({
        server: async () => {
          const server = new FastMCP({
            name: 'Test',
            version: '1.0.0',
          });

          server.addTool(getMarketplaceOrderTool);
          return server;
        },
        run: async ({ client }) => {
          try {
            await client.callTool({
              name: 'get_marketplace_order',
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
