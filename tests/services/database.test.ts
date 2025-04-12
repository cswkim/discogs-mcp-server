import { beforeEach, describe, expect, it } from 'vitest';
import { DatabaseService } from '../../src/services/database';
import type { SearchParams, SearchResults } from '../../src/types/database';

// Mock search results data
const mockSearchResults: SearchResults = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 1,
    urls: {
      first: 'https://api.discogs.com/database/search?page=1',
      last: 'https://api.discogs.com/database/search?page=1',
    },
  },
  results: [
    {
      id: 123,
      title: 'Test Release',
      type: 'release',
      uri: 'https://www.discogs.com/release/123',
      resource_url: 'https://api.discogs.com/releases/123',
      thumb: 'https://example.com/thumb.jpg',
      cover_image: 'https://example.com/cover.jpg',
      country: 'US',
      year: '2020',
      format: ['Vinyl', 'LP'],
      label: ['Test Label'],
      genre: ['Rock'],
      style: ['Alternative'],
      barcode: ['1234567890123'],
      catno: 'TEST-001',
      master_id: 456,
      master_url: 'https://api.discogs.com/masters/456',
      format_quantity: 1,
      formats: [
        {
          name: 'Vinyl',
          qty: '1',
          descriptions: ['LP'],
        },
      ],
      community: {
        have: 42,
        want: 10,
      },
      user_data: {
        in_collection: true,
        in_wantlist: false,
      },
    },
  ],
};

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    service = new DatabaseService();
  });

  describe('search', () => {
    it('should return search results with default parameters', async () => {
      (service as any).request.mockResolvedValueOnce(mockSearchResults);

      const result = await service.search({ q: 'test', per_page: 50 });

      expect(result).toEqual(mockSearchResults);
      expect(service['request']).toHaveBeenCalledWith('/search', {
        params: { q: 'test', per_page: 50 },
      });
    });

    it('should handle all search parameters correctly', async () => {
      (service as any).request.mockResolvedValueOnce(mockSearchResults);

      const searchParams: SearchParams = {
        q: 'test',
        type: 'release',
        title: 'Test Title',
        release_title: 'Test Release',
        credit: 'Test Credit',
        artist: 'Test Artist',
        anv: 'Test ANV',
        label: 'Test Label',
        genre: 'Rock',
        style: 'Alternative',
        country: 'US',
        year: '2020',
        format: 'Vinyl',
        catno: 'TEST-001',
        barcode: '1234567890123',
        track: 'Test Track',
        submitter: 'Test User',
        contributor: 'Test Contributor',
        page: 1,
        per_page: 50,
        sort: 'year',
        sort_order: 'desc',
      };

      const result = await service.search(searchParams);

      expect(result).toEqual(mockSearchResults);
      expect(service['request']).toHaveBeenCalledWith('/search', {
        params: searchParams,
      });
    });

    it('should handle pagination parameters correctly', async () => {
      (service as any).request.mockResolvedValueOnce(mockSearchResults);

      const result = await service.search({
        q: 'test',
        page: 2,
        per_page: 20,
      });

      expect(result).toEqual(mockSearchResults);
      expect(service['request']).toHaveBeenCalledWith('/search', {
        params: { q: 'test', page: 2, per_page: 20 },
      });
    });

    it('should handle sorting parameters correctly', async () => {
      (service as any).request.mockResolvedValueOnce(mockSearchResults);

      const result = await service.search({
        q: 'test',
        per_page: 50,
        sort: 'year',
        sort_order: 'desc',
      });

      expect(result).toEqual(mockSearchResults);
      expect(service['request']).toHaveBeenCalledWith('/search', {
        params: { q: 'test', per_page: 50, sort: 'year', sort_order: 'desc' },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.search({ q: 'test', per_page: 50 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidResults = {
        pagination: { page: 1, pages: 1, items: 1 },
        results: [{ id: 'not-a-number', title: 'Test Release' }],
      };
      (service as any).request.mockResolvedValueOnce(invalidResults);

      await expect(service.search({ q: 'test', per_page: 50 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.search({ q: 'test', per_page: 50 })).rejects.toThrow(
        'Failed to search database:',
      );
    });
  });
});
