import { beforeEach, describe, expect, it } from 'vitest';
import { ReleaseService } from '../../src/services/release';
import type { Release, ReleaseRating, ReleaseRatingCommunity } from '../../src/types/release';

// Mock release data
const mockRelease: Release = {
  id: 123,
  title: 'Test Release',
  year: 2024,
  resource_url: 'https://api.discogs.com/releases/123',
  artists: [
    {
      id: 101,
      name: 'Test Artist',
      resource_url: 'https://api.discogs.com/artists/101',
      join: '',
      anv: '',
      role: 'Main',
      tracks: '',
    },
  ],
  labels: [
    {
      id: 201,
      name: 'Test Label',
      resource_url: 'https://api.discogs.com/labels/201',
      catno: 'TEST001',
    },
  ],
  formats: [
    {
      name: 'Vinyl',
      qty: '1',
      descriptions: ['12"', '33 RPM'],
    },
  ],
  genres: ['Test Genre'],
  styles: ['Test Style'],
  tracklist: [
    {
      position: '1',
      title: 'Test Track 1',
      duration: '3:45',
      type_: 'track',
    },
  ],
  images: [
    {
      type: 'primary',
      uri: 'https://example.com/image.jpg',
      resource_url: 'https://api.discogs.com/images/123',
      uri150: 'https://example.com/image-150.jpg',
      width: 500,
      height: 500,
    },
  ],
  videos: [
    {
      uri: 'https://www.youtube.com/watch?v=test',
      title: 'Test Video',
      description: 'Test video description',
      duration: 180,
      embed: true,
    },
  ],
  data_quality: 'Correct',
};

// Mock rating data
const mockRating: ReleaseRating = {
  username: 'testuser',
  release_id: 123,
  rating: 4,
};

// Mock community rating data
const mockCommunityRating: ReleaseRatingCommunity = {
  release_id: 123,
  rating: {
    average: 4.5,
    count: 100,
  },
};

describe('ReleaseService', () => {
  let service: ReleaseService;

  beforeEach(() => {
    service = new ReleaseService();
  });

  describe('get', () => {
    it('should return a validated release object', async () => {
      (service as any).request.mockResolvedValueOnce(mockRelease);

      const result = await service.get({ release_id: 123 });

      expect(result).toEqual(mockRelease);
      expect(service['request']).toHaveBeenCalledWith('/123', { params: {} });
    });

    it('should handle currency parameter', async () => {
      (service as any).request.mockResolvedValueOnce(mockRelease);

      const result = await service.get({ release_id: 123, curr_abbr: 'USD' });

      expect(result).toEqual(mockRelease);
      expect(service['request']).toHaveBeenCalledWith('/123', {
        params: { curr_abbr: 'USD' },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ release_id: 999 })).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ release_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidRelease = { ...mockRelease, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidRelease);

      await expect(service.get({ release_id: 999 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.get({ release_id: 999 })).rejects.toThrow('Failed to get release:');
    });
  });

  describe('getRatingByUser', () => {
    it('should return a validated rating object', async () => {
      (service as any).request.mockResolvedValueOnce(mockRating);

      const result = await service.getRatingByUser({
        username: 'testuser',
        release_id: 123,
      });

      expect(result).toEqual(mockRating);
      expect(service['request']).toHaveBeenCalledWith('/123/rating/testuser');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidRating = { ...mockRating, rating: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidRating);

      await expect(
        service.getRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.getRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('Failed to get release rating:');
    });
  });

  describe('editRatingByUser', () => {
    it('should return a validated rating object', async () => {
      (service as any).request.mockResolvedValueOnce(mockRating);

      const result = await service.editRatingByUser({
        username: 'testuser',
        release_id: 123,
        rating: 4,
      });

      expect(result).toEqual(mockRating);
      expect(service['request']).toHaveBeenCalledWith('/123/rating/testuser', {
        method: 'PUT',
        body: { rating: 4 },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editRatingByUser({
          username: 'testuser',
          release_id: 999,
          rating: 4,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editRatingByUser({
          username: 'testuser',
          release_id: 999,
          rating: 4,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editRatingByUser({
          username: 'testuser',
          release_id: 999,
          rating: 4,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidRating = { ...mockRating, rating: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidRating);

      await expect(
        service.editRatingByUser({
          username: 'testuser',
          release_id: 999,
          rating: 4,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.editRatingByUser({
          username: 'testuser',
          release_id: 999,
          rating: 4,
        }),
      ).rejects.toThrow('Failed to edit release rating:');
    });
  });

  describe('deleteRatingByUser', () => {
    it('should successfully delete a rating', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.deleteRatingByUser({
        username: 'testuser',
        release_id: 123,
      });

      expect(service['request']).toHaveBeenCalledWith('/123/rating/testuser', {
        method: 'DELETE',
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.deleteRatingByUser({ username: 'testuser', release_id: 999 }),
      ).rejects.toThrow('Failed to delete release rating:');
    });
  });

  describe('getCommunityRating', () => {
    it('should return a validated community rating object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCommunityRating);

      const result = await service.getCommunityRating({ release_id: 123 });

      expect(result).toEqual(mockCommunityRating);
      expect(service['request']).toHaveBeenCalledWith('/123/rating');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getCommunityRating({ release_id: 999 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getCommunityRating({ release_id: 999 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidRating = {
        ...mockCommunityRating,
        rating: { average: 'not-a-number', count: 100 },
      };
      (service as any).request.mockResolvedValueOnce(invalidRating);

      await expect(service.getCommunityRating({ release_id: 999 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getCommunityRating({ release_id: 999 })).rejects.toThrow(
        'Failed to get release community rating:',
      );
    });
  });
});
