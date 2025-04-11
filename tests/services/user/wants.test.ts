import { beforeEach, describe, expect, it } from 'vitest';
import { UserWantsService } from '../../../src/services/user/wants';
import type { UserWantlist, UserWantlistItem } from '../../../src/types/user';

// Mock wantlist data
const mockWantlist: UserWantlist = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 1,
    urls: {
      last: 'https://api.discogs.com/users/testuser/wants?page=1',
      next: 'https://api.discogs.com/users/testuser/wants?page=1',
    },
  },
  wants: [
    {
      id: 123,
      rating: 5,
      notes: 'Test note',
      resource_url: 'https://api.discogs.com/users/testuser/wants/123',
      basic_information: {
        id: 123,
        title: 'Test Release',
        year: 2024,
        resource_url: 'https://api.discogs.com/releases/123',
        artists: [
          {
            id: 789,
            name: 'Test Artist',
            resource_url: 'https://api.discogs.com/artists/789',
            join: ',',
            anv: '',
            role: '',
            tracks: '',
          },
        ],
        labels: [
          {
            id: 101,
            name: 'Test Label',
            resource_url: 'https://api.discogs.com/labels/101',
            catno: 'TEST001',
          },
        ],
        formats: [
          {
            name: 'Vinyl',
            qty: '1',
            text: '12"',
            descriptions: ['LP'],
          },
        ],
        genres: ['Electronic'],
        styles: ['House'],
        thumb: 'https://example.com/thumb.jpg',
        cover_image: 'https://example.com/cover.jpg',
        master_id: 202,
        master_url: 'https://api.discogs.com/masters/202',
      },
    },
  ],
};

// Mock wantlist item data
const mockWantlistItem: UserWantlistItem = {
  id: 123,
  rating: 5,
  notes: 'Test note',
  resource_url: 'https://api.discogs.com/users/testuser/wants/123',
  basic_information: {
    id: 123,
    title: 'Test Release',
    year: 2024,
    resource_url: 'https://api.discogs.com/releases/123',
    artists: [
      {
        id: 789,
        name: 'Test Artist',
        resource_url: 'https://api.discogs.com/artists/789',
        join: ',',
        anv: '',
        role: '',
        tracks: '',
      },
    ],
    labels: [
      {
        id: 101,
        name: 'Test Label',
        resource_url: 'https://api.discogs.com/labels/101',
        catno: 'TEST001',
      },
    ],
    formats: [
      {
        name: 'Vinyl',
        qty: '1',
        text: '12"',
        descriptions: ['LP'],
      },
    ],
    genres: ['Electronic'],
    styles: ['House'],
    thumb: 'https://example.com/thumb.jpg',
    cover_image: 'https://example.com/cover.jpg',
    master_id: 202,
    master_url: 'https://api.discogs.com/masters/202',
  },
};

describe('UserWantsService', () => {
  let service: UserWantsService;

  beforeEach(() => {
    service = new UserWantsService();
  });

  describe('getList', () => {
    it('should return a validated wantlist object', async () => {
      (service as any).request.mockResolvedValueOnce(mockWantlist);

      const result = await service.getList({ username: 'testuser', page: 1, per_page: 50 });

      expect(result).toEqual(mockWantlist);
      expect(service['request']).toHaveBeenCalledWith('/testuser/wants', {
        params: { page: 1, per_page: 50 },
      });
    });

    it('should handle authentication errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getList({ username: 'testuser', page: 1, per_page: 50 }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle permission errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getList({ username: 'testuser', page: 1, per_page: 50 }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle resource not found errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getList({ username: 'testuser', page: 1, per_page: 50 }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.getList({ username: 'testuser', page: 1, per_page: 50 }),
      ).rejects.toThrow('Failed to get wantlist:');
    });
  });

  describe('addItem', () => {
    it('should add an item to the wantlist', async () => {
      (service as any).request.mockResolvedValueOnce(mockWantlistItem);

      const result = await service.addItem({
        username: 'testuser',
        release_id: 123,
        notes: 'Test note',
        rating: 5,
      });

      expect(result).toEqual(mockWantlistItem);
      expect(service['request']).toHaveBeenCalledWith('/testuser/wants/123', {
        method: 'PUT',
        body: { notes: 'Test note', rating: 5 },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.addItem({
          username: 'testuser',
          release_id: 123,
          notes: 'Test note',
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.addItem({
          username: 'otheruser',
          release_id: 123,
          notes: 'Test note',
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.addItem({
          username: 'nonexistent',
          release_id: 123,
          notes: 'Test note',
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidItem = {
        id: 'not-a-number',
        rating: 5,
        notes: 'Test note',
        resource_url: 'https://api.discogs.com/users/testuser/wants/123',
        basic_information: mockWantlistItem.basic_information,
      };
      (service as any).request.mockResolvedValueOnce(invalidItem);

      await expect(
        service.addItem({
          username: 'testuser',
          release_id: 123,
          notes: 'Test note',
          rating: 5,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.addItem({
          username: 'testuser',
          release_id: 123,
          notes: 'Test note',
          rating: 5,
        }),
      ).rejects.toThrow('Failed to add to wantlist:');
    });
  });

  describe('editItem', () => {
    it('should edit an item in the wantlist', async () => {
      (service as any).request.mockResolvedValueOnce(mockWantlistItem);

      const result = await service.editItem({
        username: 'testuser',
        release_id: 123,
        notes: 'Updated note',
        rating: 4,
      });

      expect(result).toEqual(mockWantlistItem);
      expect(service['request']).toHaveBeenCalledWith('/testuser/wants/123', {
        method: 'POST',
        body: { notes: 'Updated note', rating: 4 },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editItem({
          username: 'testuser',
          release_id: 123,
          notes: 'Updated note',
          rating: 4,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editItem({
          username: 'otheruser',
          release_id: 123,
          notes: 'Updated note',
          rating: 4,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editItem({
          username: 'nonexistent',
          release_id: 123,
          notes: 'Updated note',
          rating: 4,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidItem = {
        id: 'not-a-number',
        rating: 5,
        notes: 'Test note',
        resource_url: 'https://api.discogs.com/users/testuser/wants/123',
        basic_information: mockWantlistItem.basic_information,
      };
      (service as any).request.mockResolvedValueOnce(invalidItem);

      await expect(
        service.editItem({
          username: 'testuser',
          release_id: 123,
          notes: 'Updated note',
          rating: 4,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.editItem({
          username: 'testuser',
          release_id: 123,
          notes: 'Updated note',
          rating: 4,
        }),
      ).rejects.toThrow('Failed to add to wantlist:');
    });
  });

  describe('deleteItem', () => {
    it('should delete an item from the wantlist', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.deleteItem({
        username: 'testuser',
        release_id: 123,
      });

      expect(service['request']).toHaveBeenCalledWith('/testuser/wants/123', {
        method: 'DELETE',
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteItem({
          username: 'testuser',
          release_id: 123,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteItem({
          username: 'otheruser',
          release_id: 123,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteItem({
          username: 'nonexistent',
          release_id: 123,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.deleteItem({
          username: 'testuser',
          release_id: 123,
        }),
      ).rejects.toThrow('Failed to delete from wantlist:');
    });
  });
});
