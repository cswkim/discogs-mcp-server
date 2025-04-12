import { beforeEach, describe, expect, it } from 'vitest';
import { ListService } from '../../src/services/list';
import type { List } from '../../src/types/list';

// Mock list data
const mockList: List = {
  id: 123,
  user: {
    id: 456,
    avatar_url: 'https://example.com/avatar.jpg',
    username: 'testuser',
    resource_url: 'https://api.discogs.com/users/testuser',
  },
  name: 'Test List',
  description: 'A test list for testing purposes',
  public: true,
  date_added: '2024-01-01T00:00:00Z',
  date_changed: '2024-01-02T00:00:00Z',
  uri: 'https://www.discogs.com/lists/123',
  resource_url: 'https://api.discogs.com/lists/123',
  image_url: 'https://example.com/list.jpg',
  items: [
    {
      id: 789,
      comment: 'Test comment',
      display_title: 'Test Item',
      image_url: 'https://example.com/item.jpg',
      resource_url: 'https://api.discogs.com/releases/789',
      stats: {
        community: {
          in_collection: 42,
          in_wantlist: 10,
        },
        user: {
          in_collection: 1,
          in_wantlist: 0,
        },
      },
      type: 'release',
      uri: 'https://www.discogs.com/release/789',
    },
  ],
};

describe('ListService', () => {
  let service: ListService;

  beforeEach(() => {
    service = new ListService();
  });

  describe('getList', () => {
    it('should return a validated list object', async () => {
      (service as any).request.mockResolvedValueOnce(mockList);

      const result = await service.getList({ list_id: 123 });

      expect(result).toEqual(mockList);
      expect(service['request']).toHaveBeenCalledWith('/123');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getList({ list_id: 999 })).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getList({ list_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidList = { ...mockList, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidList);

      await expect(service.getList({ list_id: 999 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getList({ list_id: 999 })).rejects.toThrow('Failed to get list:');
    });
  });
});
