// Mock imports need to go before all other imports
import '../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { MarketplaceService } from '../../src/services/marketplace.js';

const mockListing = {
  id: 123,
  resource_url: 'https://api.discogs.com/marketplace/listings/123',
  uri: 'https://www.discogs.com/sell/item/123',
  status: 'For Sale',
  condition: 'Very Good (VG)',
  sleeve_condition: 'Very Good (VG)',
  comments: 'Test comments',
  ships_from: 'United States',
  posted: '2024-04-15T18:43:39-07:00',
  allow_offers: true,
  offer_submitted: false,
  audio: false,
  price: {
    currency: 'USD',
    value: 19.99,
  },
  original_price: {
    curr_abbr: 'USD',
    curr_id: 1,
    formatted: '$19.99',
    value: 19.99,
  },
  shipping_price: {
    currency: 'USD',
    value: 5.0,
  },
  original_shipping_price: {
    curr_abbr: 'USD',
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

describe('MarketplaceService', () => {
  let service: MarketplaceService;

  beforeEach(() => {
    service = new MarketplaceService();
  });

  it('should get a listing', async () => {
    (service as any).request.mockResolvedValueOnce(mockListing);

    const listing = await service.getListing({ listing_id: 123 });

    expect(listing).toEqual(mockListing);
    expect(service['request']).toHaveBeenCalledWith('/listings/123', { params: {} });
  });

  it('should handle currency parameter', async () => {
    (service as any).request.mockResolvedValueOnce(mockListing);

    const result = await service.getListing({ listing_id: 123, curr_abbr: 'USD' });

    expect(result).toEqual(mockListing);
    expect(service['request']).toHaveBeenCalledWith('/listings/123', {
      params: { curr_abbr: 'USD' },
    });
  });

  it('should handle Discogs resource not found errors properly', async () => {
    const discogsError = new Error('Discogs API Error');
    discogsError.name = 'DiscogsResourceNotFoundError';
    (service as any).request.mockRejectedValueOnce(discogsError);

    await expect(service.getListing({ listing_id: 999 })).rejects.toThrow(
      'DiscogsResourceNotFoundError',
    );
  });
});
