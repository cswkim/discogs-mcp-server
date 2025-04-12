// Mock imports need to go before all other imports
import '../../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { UserListsService } from '../../../src/services/user/lists';
import type { UserLists } from '../../../src/types/user';

// Mock user lists data
const mockUserLists: UserLists = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 2,
    urls: {
      last: 'https://api.discogs.com/users/testuser/lists?page=1',
      next: 'https://api.discogs.com/users/testuser/lists?page=1',
    },
  },
  lists: [
    {
      id: 123,
      name: 'Test List 1',
      description: 'Test list description 1',
      public: true,
      date_added: '2024-01-01T00:00:00Z',
      date_changed: '2024-01-02T00:00:00Z',
      resource_url: 'https://api.discogs.com/lists/123',
      uri: 'https://www.discogs.com/lists/123',
    },
    {
      id: 124,
      name: 'Test List 2',
      description: 'Test list description 2',
      public: false,
      date_added: '2024-01-03T00:00:00Z',
      date_changed: '2024-01-04T00:00:00Z',
      resource_url: 'https://api.discogs.com/lists/124',
      uri: 'https://www.discogs.com/lists/124',
    },
  ],
};

describe('UserListsService', () => {
  let service: UserListsService;

  beforeEach(() => {
    service = new UserListsService();
  });

  describe('get', () => {
    it('should return a validated user lists object', async () => {
      (service as any).request.mockResolvedValueOnce(mockUserLists);

      const result = await service.get({ username: 'testuser', per_page: 50 });

      expect(result).toEqual(mockUserLists);
      expect(service['request']).toHaveBeenCalledWith('/testuser/lists', {
        params: { per_page: 50 },
      });
    });

    it('should handle pagination parameters', async () => {
      (service as any).request.mockResolvedValueOnce(mockUserLists);

      const result = await service.get({
        username: 'testuser',
        page: 2,
        per_page: 25,
        sort: 'name',
        sort_order: 'asc',
      });

      expect(result).toEqual(mockUserLists);
      expect(service['request']).toHaveBeenCalledWith('/testuser/lists', {
        params: { page: 2, per_page: 25, sort: 'name', sort_order: 'asc' },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ username: 'testuser', per_page: 50 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ username: 'nonexistent', per_page: 50 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidLists = {
        pagination: {
          page: 'not-a-number',
          pages: 1,
          per_page: 50,
          items: 2,
          urls: {
            last: 'https://api.discogs.com/users/testuser/lists?page=1',
            next: 'https://api.discogs.com/users/testuser/lists?page=1',
          },
        },
        lists: [],
      };
      (service as any).request.mockResolvedValueOnce(invalidLists);

      await expect(service.get({ username: 'testuser', per_page: 50 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.get({ username: 'testuser', per_page: 50 })).rejects.toThrow(
        'Failed to get lists:',
      );
    });
  });
});
