import { beforeEach, describe, expect, it } from 'vitest';
import { UserProfileService } from '../../../src/services/user/profile';
import type { UserProfile } from '../../../src/types/user';

// Mock user profile data
const mockUserProfile: UserProfile = {
  id: 123,
  username: 'testuser',
  resource_url: 'https://api.discogs.com/users/testuser',
  uri: 'https://www.discogs.com/user/testuser',
  name: 'Test User',
  home_page: 'https://example.com',
  location: 'Test Location',
  profile: 'Test profile description',
  registered: '2024-01-01T00:00:00Z',
  rank: 1,
  num_pending: 0,
  num_for_sale: 5,
  num_lists: 3,
  releases_contributed: 10,
  releases_rated: 20,
  rating_avg: 4.5,
  inventory_url: 'https://api.discogs.com/users/testuser/inventory',
  collection_folders_url: 'https://api.discogs.com/users/testuser/collection/folders',
  collection_fields_url: 'https://api.discogs.com/users/testuser/collection/fields',
  wantlist_url: 'https://api.discogs.com/users/testuser/wants',
  avatar_url: 'https://example.com/avatar.jpg',
  curr_abbr: 'USD',
  activated: true,
  marketplace_suspended: false,
  banner_url: 'https://example.com/banner.jpg',
  buyer_rating: 4.8,
  buyer_rating_stars: 5,
  buyer_num_ratings: 20,
  seller_rating: 4.9,
  seller_rating_stars: 5,
  seller_num_ratings: 15,
  is_staff: false,
  email: 'test@example.com',
  num_collection: 100,
  num_wantlist: 50,
  num_unread: 0,
};

describe('UserProfileService', () => {
  let service: UserProfileService;

  beforeEach(() => {
    service = new UserProfileService();
  });

  describe('get', () => {
    it('should return a validated user profile object', async () => {
      (service as any).request.mockResolvedValueOnce(mockUserProfile);

      const result = await service.get({ username: 'testuser' });

      expect(result).toEqual(mockUserProfile);
      expect(service['request']).toHaveBeenCalledWith('/testuser');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ username: 'testuser' })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
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
      const invalidProfile = { ...mockUserProfile, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidProfile);

      await expect(service.get({ username: 'testuser' })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.get({ username: 'testuser' })).rejects.toThrow('Failed to get profile:');
    });
  });

  describe('edit', () => {
    it('should return a validated user profile object after edit', async () => {
      (service as any).request.mockResolvedValueOnce(mockUserProfile);

      const result = await service.edit({
        username: 'testuser',
        name: 'Updated Name',
        home_page: 'https://updated.com',
      });

      expect(result).toEqual(mockUserProfile);
      expect(service['request']).toHaveBeenCalledWith('/testuser', {
        method: 'POST',
        body: {
          name: 'Updated Name',
          home_page: 'https://updated.com',
        },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.edit({
          username: 'testuser',
          name: 'Updated Name',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.edit({
          username: 'otheruser',
          name: 'Updated Name',
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.edit({
          username: 'nonexistent',
          name: 'Updated Name',
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidProfile = { ...mockUserProfile, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidProfile);

      await expect(
        service.edit({
          username: 'testuser',
          name: 'Updated Name',
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.edit({
          username: 'testuser',
          name: 'Updated Name',
        }),
      ).rejects.toThrow('Failed to edit profile:');
    });
  });
});
