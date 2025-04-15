import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { formatDiscogsError } from '../../src/errors.js';
import { MarketplaceService } from '../../src/services/marketplace.js';
import { getMarketplaceListingTool } from '../../src/tools/marketplace.js';
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

describe('Marketplace Tools', () => {
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
              arguments: { listing_id: 123, currency: 'USD' },
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
              arguments: { listing_id: 123, currency: 'USD' },
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
});
