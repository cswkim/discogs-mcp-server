import { beforeEach, describe, expect, it } from 'vitest';
import { LabelService } from '../../src/services/label';
import type { Label, LabelReleases } from '../../src/types/label';

// Mock label data
const mockLabel: Label = {
  id: 123,
  name: 'Test Label',
  resource_url: 'https://discogs.test/label/123',
  contact_info: 'test@example.com',
  profile: 'Test label profile',
  urls: ['https://example.com/label'],
  images: [
    {
      height: 1000,
      width: 1000,
      resource_url: 'https://example.com/label.jpg',
      type: 'primary',
      uri: 'https://example.com/label.jpg',
      uri150: 'https://example.com/label-150.jpg',
    },
  ],
  parent_label: {
    id: 456,
    name: 'Parent Label',
    resource_url: 'https://api.discogs.com/labels/456',
  },
  sublabels: [
    {
      id: 789,
      name: 'Sub Label',
      resource_url: 'https://api.discogs.com/labels/789',
    },
  ],
  uri: 'https://www.discogs.com/label/123',
  releases_url: 'https://api.discogs.com/labels/123/releases',
  data_quality: 'Correct',
};

// Mock label releases data
const mockReleases: LabelReleases = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 1,
    urls: {
      first: 'https://api.discogs.com/labels/123/releases?page=1',
      last: 'https://api.discogs.com/labels/123/releases?page=1',
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

describe('LabelService', () => {
  let service: LabelService;

  beforeEach(() => {
    service = new LabelService();
  });

  describe('get', () => {
    it('should return a validated label object', async () => {
      (service as any).request.mockResolvedValueOnce(mockLabel);

      const result = await service.get({ label_id: 123 });

      expect(result).toEqual(mockLabel);
      expect(service['request']).toHaveBeenCalledWith('/123');
    });

    it('should handle Discogs errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ label_id: 999 })).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle validation errors properly', async () => {
      const invalidLabel = { ...mockLabel, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidLabel);

      await expect(service.get({ label_id: 999 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.get({ label_id: 999 })).rejects.toThrow('Failed to get label:');
    });
  });

  describe('getReleases', () => {
    it('should return a validated label releases object with default parameters', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleases);

      const result = await service.getReleases({
        label_id: 123,
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
        label_id: 123,
        page: 2,
        per_page: 20,
      });

      expect(result).toEqual(mockReleases);
      expect(service['request']).toHaveBeenCalledWith('/123/releases', {
        params: { page: 2, per_page: 20 },
      });
    });

    it('should handle sorting parameters correctly', async () => {
      (service as any).request.mockResolvedValueOnce(mockReleases);

      const result = await service.getReleases({
        label_id: 123,
        per_page: 50,
        sort: 'year',
        sort_order: 'desc',
      });

      expect(result).toEqual(mockReleases);
      expect(service['request']).toHaveBeenCalledWith('/123/releases', {
        params: { per_page: 50, sort: 'year', sort_order: 'desc' },
      });
    });

    it('should handle Discogs errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getReleases({
          label_id: 999,
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
          label_id: 999,
          per_page: 50,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.getReleases({
          label_id: 999,
          per_page: 50,
        }),
      ).rejects.toThrow('Failed to get label releases:');
    });
  });
});
