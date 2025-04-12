// Mock imports need to go before all other imports
import '../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { ArtistService } from '../../src/services/artist';
import type { Artist, ArtistReleases } from '../../src/types/artist';

// Mock artist data
const mockArtist: Artist = {
  id: 123,
  name: 'Test Artist',
  resource_url: 'https://discogs.test/artist/123',
  realname: 'Test Real Name',
  profile: 'Test artist profile',
  urls: ['https://example.com/artist'],
  namevariations: ['Test Artist Variation'],
  aliases: [
    {
      id: 102,
      name: 'Test Alias',
      resource_url: 'https://api.discogs.com/artists/102',
    },
  ],
  members: [
    {
      id: 103,
      name: 'Test Member',
      resource_url: 'https://api.discogs.com/artists/103',
      active: true,
    },
  ],
  images: [
    {
      height: 1000,
      width: 1000,
      resource_url: 'https://example.com/artist.jpg',
      type: 'primary',
      uri: 'https://example.com/artist.jpg',
      uri150: 'https://example.com/artist-150.jpg',
    },
  ],
  uri: 'https://www.discogs.com/artist/123',
  releases_url: 'https://api.discogs.com/artists/123/releases',
  data_quality: 'Correct',
};

// Mock artist releases data
const mockReleases: ArtistReleases = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 1,
    urls: {
      first: 'https://api.discogs.com/artists/123/releases?page=1',
      last: 'https://api.discogs.com/artists/123/releases?page=1',
    },
  },
  releases: [
    {
      id: 456,
      title: 'Test Release',
      year: 2020,
      artist: 'Test Artist',
      resource_url: 'https://api.discogs.com/releases/456',
      thumb: 'https://example.com/thumb.jpg',
      format: 'Vinyl',
      label: 'Test Label',
      catno: 'TEST-001',
      status: 'Accepted',
      type: 'release',
      role: 'Main',
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
    },
  ],
};

describe('ArtistService', () => {
  let service: ArtistService;

  beforeEach(() => {
    service = new ArtistService();
  });

  describe('get', () => {
    it('should return a validated artist object', async () => {
      (service as any).request.mockResolvedValueOnce(mockArtist);

      const result = await service.get({ artist_id: 123 });

      expect(result).toEqual(mockArtist);
      expect(service['request']).toHaveBeenCalledWith('/123');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ artist_id: 999 })).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidArtist = { ...mockArtist, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidArtist);

      await expect(service.get({ artist_id: 999 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.get({ artist_id: 999 })).rejects.toThrow('Failed to get artist:');
    });
  });

  describe('getReleases', () => {
    it('should return a validated artist releases object with default parameters', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleases);

      const result = await service.getReleases({
        artist_id: 123,
        per_page: 50,
      });

      expect(result).toEqual(mockReleases);
      expect(service['request']).toHaveBeenCalledWith('/123/releases', {
        params: { per_page: 50 },
      });
    });

    it('should handle pagination parameters correctly', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleases);

      const result = await service.getReleases({
        artist_id: 123,
        per_page: 20,
        page: 2,
      });

      expect(result).toEqual(mockReleases);
      expect(service['request']).toHaveBeenCalledWith('/123/releases', {
        params: { per_page: 20, page: 2 },
      });
    });

    it('should handle sorting parameters correctly', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleases);

      const result = await service.getReleases({
        artist_id: 123,
        per_page: 50,
        sort: 'year',
        sort_order: 'desc',
      });

      expect(result).toEqual(mockReleases);
      expect(service['request']).toHaveBeenCalledWith('/123/releases', {
        params: { per_page: 50, sort: 'year', sort_order: 'desc' },
      });
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getReleases({
          artist_id: 999,
          per_page: 50,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidReleases = {
        pagination: { page: 1, pages: 1, items: 1 },
        releases: [{ id: 'not-a-number', title: 'Test Release' }],
      };
      (service as any).request.mockResolvedValueOnce(invalidReleases);

      await expect(
        service.getReleases({
          artist_id: 999,
          per_page: 50,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.getReleases({
          artist_id: 999,
          per_page: 50,
        }),
      ).rejects.toThrow('Failed to get artist releases:');
    });
  });
});
