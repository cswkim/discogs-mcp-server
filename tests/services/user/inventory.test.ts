// Mock imports need to go before all other imports
import '../../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { UserInventoryService } from '../../../src/services/user/inventory';
import type { UserInventoryResponse } from '../../../src/types/user';

// Mock inventory response
const mockInventoryResponse: UserInventoryResponse = {
  pagination: {
    page: 1,
    per_page: 50,
    pages: 2,
    items: 75,
    urls: {
      first: 'https://api.discogs.com/users/testuser/inventory?page=1',
      next: 'https://api.discogs.com/users/testuser/inventory?page=2',
      last: 'https://api.discogs.com/users/testuser/inventory?page=2',
    },
  },
  listings: [
    {
      id: 123,
      status: 'For Sale',
      condition: 'Mint (M)',
      price: {
        value: 29.99,
        currency: 'USD',
      },
      allow_offers: true,
      sleeve_condition: 'Near Mint (NM or M-)',
      comments: 'Test listing',
      audio: true,
      resource_url: 'https://api.discogs.com/marketplace/listings/123',
      uri: 'https://www.discogs.com/sell/item/123',
      ships_from: 'US',
      posted: '2024-01-01T00:00:00Z',
      original_price: {
        value: 29.99,
        curr_abbr: 'USD',
      },
      seller: {
        id: 789,
        username: 'testuser',
        stats: {
          rating: '4.5',
          stars: 4.5,
          total: 100,
        },
        min_order_total: 0,
        html_url: 'https://www.discogs.com/user/testuser',
        uid: 789,
        url: 'https://api.discogs.com/users/testuser',
        payment: 'PayPal',
        shipping: 'Worldwide',
        resource_url: 'https://api.discogs.com/users/testuser',
        avatar_url: 'https://api.discogs.com/images/u-789-1.jpg',
      },
      release: {
        id: 456,
        description: 'Test Release',
        resource_url: 'https://api.discogs.com/releases/456',
        stats: {
          community: {
            in_wantlist: 10,
            in_collection: 20,
          },
        },
        year: 2020,
        artist: 'Test Artist',
        title: 'Test Title',
        format: 'Vinyl, LP',
        thumbnail: 'https://api.discogs.com/images/R-456-1.jpg',
      },
    },
  ],
};

describe('UserInventoryService', () => {
  let service: UserInventoryService;

  beforeEach(() => {
    service = new UserInventoryService();
  });

  describe('get', () => {
    it('should return a validated inventory response', async () => {
      (service as any).request.mockResolvedValueOnce(mockInventoryResponse);

      const result = await service.get({ username: 'testuser' });

      expect(result).toEqual(mockInventoryResponse);
      expect(service['request']).toHaveBeenCalledWith('/testuser/inventory', {
        params: {},
      });
    });

    it('should pass query parameters to the API', async () => {
      (service as any).request.mockResolvedValueOnce(mockInventoryResponse);

      const params = {
        username: 'testuser',
        page: 2,
        per_page: 25,
        status: 'Draft' as const,
        sort: 'price',
        sort_order: 'desc' as const,
      };

      await service.get(params);

      expect(service['request']).toHaveBeenCalledWith('/testuser/inventory', {
        params: {
          page: 2,
          per_page: 25,
          status: 'Draft',
          sort: 'price',
          sort_order: 'desc',
        },
      });
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ username: 'nonexistent' })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidResponse = { ...mockInventoryResponse, listings: [{ id: 'not-a-number' }] };
      (service as any).request.mockResolvedValueOnce(invalidResponse);

      await expect(service.get({ username: 'testuser' })).rejects.toThrow();
    });
  });
});
