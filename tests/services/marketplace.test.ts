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

const mockListingNewResponse = {
  listing_id: 123,
  resource_url: 'https://api.discogs.com/marketplace/listings/123',
};

describe('MarketplaceService', () => {
  let service: MarketplaceService;

  beforeEach(() => {
    service = new MarketplaceService();
  });

  describe('createListing', () => {
    it('should create a listing', async () => {
      (service as any).request.mockResolvedValueOnce(mockListingNewResponse);

      const result = await service.createListing({
        release_id: 123,
        condition: 'Very Good (VG)',
        sleeve_condition: 'Very Good (VG)',
        price: 19.99,
        status: 'For Sale',
        format_quantity: 1,
      });

      expect(result).toEqual(mockListingNewResponse);
      expect(service['request']).toHaveBeenCalledWith('/listings', {
        method: 'POST',
        body: {
          release_id: 123,
          condition: 'Very Good (VG)',
          sleeve_condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
          format_quantity: 1,
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createListing({
          release_id: 123,
          condition: 'Very Good (VG)',
          sleeve_condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createListing({
          release_id: 123,
          condition: 'Very Good (VG)',
          sleeve_condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
          format_quantity: 1,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });
  });

  describe('deleteListing', () => {
    it('should delete a listing', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.deleteListing({ listing_id: 123 });

      expect(service['request']).toHaveBeenCalledWith('/listings/123', {
        method: 'DELETE',
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.deleteListing({ listing_id: 123 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.deleteListing({ listing_id: 123 })).rejects.toThrow(
        'DiscogsPermissionError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.deleteListing({ listing_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });
  });

  describe('getListing', () => {
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

  describe('updateListing', () => {
    it('should update a listing', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.updateListing({
        listing_id: 123,
        release_id: 123,
        condition: 'Very Good (VG)',
        price: 19.99,
        status: 'For Sale',
        format_quantity: 1,
      });

      expect(service['request']).toHaveBeenCalledWith('/listings/123', {
        method: 'POST',
        body: {
          release_id: 123,
          condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
          format_quantity: 1,
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.updateListing({
          listing_id: 123,
          release_id: 123,
          condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.updateListing({
          listing_id: 123,
          release_id: 123,
          condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
          format_quantity: 1,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.updateListing({
          listing_id: 999,
          release_id: 123,
          condition: 'Very Good (VG)',
          price: 19.99,
          status: 'For Sale',
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });
  });

  describe('getOrder', () => {
    const mockOrder = {
      id: 123,
      resource_url: 'https://api.discogs.com/marketplace/orders/123',
      messages_url: 'https://api.discogs.com/marketplace/orders/123/messages',
      uri: 'https://www.discogs.com/sell/order/123',
      status: 'New Order',
      next_status: ['Buyer Contacted', 'Invoice Sent'],
      fee: {
        currency: 'USD',
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
            currency: 'USD',
            value: 19.99,
          },
          media_condition: 'Very Good (VG)',
          sleeve_condition: 'Very Good (VG)',
          id: 1,
        },
      ],
      shipping: {
        currency: 'USD',
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
        currency: 'USD',
        value: 26.98,
      },
    };

    it('should get an order', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrder);

      const order = await service.getOrder({ order_id: 123 });

      expect(order).toEqual(mockOrder);
      expect(service['request']).toHaveBeenCalledWith('/orders/123');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrder({ order_id: 123 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrder({ order_id: 123 })).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrder({ order_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });
  });

  describe('editOrder', () => {
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

    it('should edit an order', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrder);

      const order = await service.editOrder({
        order_id: 123,
        status: 'Buyer Contacted' as const,
        shipping: 5.0,
      });

      expect(order).toEqual(mockOrder);
      expect(service['request']).toHaveBeenCalledWith('/orders/123', {
        method: 'POST',
        body: {
          status: 'Buyer Contacted',
          shipping: 5.0,
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editOrder({
          order_id: 123,
          status: 'Buyer Contacted' as const,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editOrder({
          order_id: 123,
          status: 'Buyer Contacted' as const,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editOrder({
          order_id: 999,
          status: 'Buyer Contacted' as const,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });
  });

  describe('getOrders', () => {
    const mockOrdersResponse = {
      pagination: {
        page: 1,
        pages: 1,
        per_page: 50,
        items: 1,
        urls: {
          last: 'https://api.discogs.com/marketplace/orders?page=1&per_page=50',
          next: 'https://api.discogs.com/marketplace/orders?page=1&per_page=50',
        },
      },
      orders: [
        {
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
        },
      ],
    };

    it('should get orders', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrdersResponse);

      const orders = await service.getOrders({});

      expect(orders).toEqual(mockOrdersResponse);
      expect(service['request']).toHaveBeenCalledWith('/orders', {
        params: {},
      });
    });

    it('should get orders with filters', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrdersResponse);

      const orders = await service.getOrders({
        status: 'New Order',
        created_after: '2024-01-01',
        created_before: '2024-12-31',
        archived: false,
        page: 1,
        per_page: 50,
        sort: 'created',
        sort_order: 'desc',
      });

      expect(orders).toEqual(mockOrdersResponse);
      expect(service['request']).toHaveBeenCalledWith('/orders', {
        params: {
          status: 'New Order',
          created_after: '2024-01-01',
          created_before: '2024-12-31',
          archived: false,
          page: 1,
          per_page: 50,
          sort: 'created',
          sort_order: 'desc',
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrders({})).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrders({})).rejects.toThrow('DiscogsPermissionError');
    });
  });

  describe('getOrderMessages', () => {
    const mockOrderMessagesResponse = {
      pagination: {
        page: 1,
        pages: 1,
        per_page: 50,
        items: 1,
        urls: {
          last: 'https://api.discogs.com/marketplace/orders/123/messages?page=1&per_page=50',
          next: 'https://api.discogs.com/marketplace/orders/123/messages?page=1&per_page=50',
        },
      },
      messages: [
        {
          timestamp: '2024-04-15T18:43:39-07:00',
          message: 'Test message',
          type: 'message',
          order: {
            id: 123,
            resource_url: 'https://api.discogs.com/marketplace/orders/123',
          },
          subject: 'Test subject',
          from: {
            id: 12345,
            resource_url: 'https://api.discogs.com/users/TestSeller',
            username: 'TestSeller',
            avatar_url: 'https://i.discogs.com/avatar.jpg',
          },
          status_id: 1,
          actor: {
            username: 'TestSeller',
            resource_url: 'https://api.discogs.com/users/TestSeller',
          },
        },
      ],
    };

    it('should get order messages', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrderMessagesResponse);

      const messages = await service.getOrderMessages({ order_id: 123 });

      expect(messages).toEqual(mockOrderMessagesResponse);
      expect(service['request']).toHaveBeenCalledWith('/orders/123/messages', {
        params: {},
      });
    });

    it('should get order messages with filters', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrderMessagesResponse);

      const messages = await service.getOrderMessages({
        order_id: 123,
        page: 1,
        per_page: 50,
        sort: 'timestamp',
        sort_order: 'desc',
      });

      expect(messages).toEqual(mockOrderMessagesResponse);
      expect(service['request']).toHaveBeenCalledWith('/orders/123/messages', {
        params: {
          page: 1,
          per_page: 50,
          sort: 'timestamp',
          sort_order: 'desc',
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrderMessages({ order_id: 123 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrderMessages({ order_id: 123 })).rejects.toThrow(
        'DiscogsPermissionError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getOrderMessages({ order_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });
  });

  describe('createOrderMessage', () => {
    const mockOrderMessageResponse = {
      timestamp: '2024-04-15T18:43:39-07:00',
      message: 'Test message',
      type: 'message',
      order: {
        id: 123,
        resource_url: 'https://api.discogs.com/marketplace/orders/123',
      },
      subject: 'Test subject',
      from: {
        id: 12345,
        resource_url: 'https://api.discogs.com/users/TestSeller',
        username: 'TestSeller',
        avatar_url: 'https://i.discogs.com/avatar.jpg',
      },
      status_id: 1,
      actor: {
        username: 'TestSeller',
        resource_url: 'https://api.discogs.com/users/TestSeller',
      },
    };

    it('should create an order message', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrderMessageResponse);

      const message = await service.createOrderMessage({
        order_id: 123,
        message: 'Test message',
        status: 'Buyer Contacted',
      });

      expect(message).toEqual(mockOrderMessageResponse);
      expect(service['request']).toHaveBeenCalledWith('/orders/123/messages', {
        method: 'POST',
        body: {
          message: 'Test message',
          status: 'Buyer Contacted',
        },
      });
    });

    it('should create an order message with only required parameters', async () => {
      (service as any).request.mockResolvedValueOnce(mockOrderMessageResponse);

      const message = await service.createOrderMessage({
        order_id: 123,
        message: 'Test message',
      });

      expect(message).toEqual(mockOrderMessageResponse);
      expect(service['request']).toHaveBeenCalledWith('/orders/123/messages', {
        method: 'POST',
        body: {
          message: 'Test message',
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createOrderMessage({
          order_id: 123,
          message: 'Test message',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createOrderMessage({
          order_id: 123,
          message: 'Test message',
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createOrderMessage({
          order_id: 999,
          message: 'Test message',
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });
  });

  describe('getReleaseStats', () => {
    const mockReleaseStatsResponse = {
      lowest_price: {
        currency: 'USD',
        value: 19.99,
      },
      num_for_sale: 5,
      blocked_from_sale: false,
    };

    it('should get release stats', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleaseStatsResponse);

      const stats = await service.getReleaseStats({ release_id: 123 });

      expect(stats).toEqual(mockReleaseStatsResponse);
      expect(service['request']).toHaveBeenCalledWith('/stats/123', {
        params: {},
      });
    });

    it('should get release stats with currency parameter', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleaseStatsResponse);

      const stats = await service.getReleaseStats({ release_id: 123, curr_abbr: 'USD' });

      expect(stats).toEqual(mockReleaseStatsResponse);
      expect(service['request']).toHaveBeenCalledWith('/stats/123', {
        params: { curr_abbr: 'USD' },
      });
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getReleaseStats({ release_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });
  });
});
