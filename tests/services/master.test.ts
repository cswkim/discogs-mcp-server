import { beforeEach, describe, expect, it } from 'vitest';
import { MasterReleaseService } from '../../src/services/master';
import type { MasterRelease } from '../../src/types/master';

// Mock master release data
const mockMasterRelease: MasterRelease = {
  id: 123,
  main_release: 456,
  most_recent_release: 789,
  versions_url: 'https://api.discogs.com/masters/123/versions',
  main_release_url: 'https://api.discogs.com/releases/456',
  most_recent_release_url: 'https://api.discogs.com/releases/789',
  title: 'Test Master Release',
  year: 2024,
  resource_url: 'https://api.discogs.com/masters/123',
  uri: 'https://www.discogs.com/master/123',
  artists: [
    {
      id: 101,
      name: 'Test Artist',
      resource_url: 'https://api.discogs.com/artists/101',
      thumbnail_url: 'https://example.com/artist.jpg',
      join: '',
      anv: '',
      role: 'Main',
      tracks: '',
    },
  ],
  tracklist: [
    {
      position: '1',
      title: 'Test Track 1',
      duration: '3:45',
      type_: 'track',
      extraartists: [
        {
          id: 102,
          name: 'Featured Artist',
          resource_url: 'https://api.discogs.com/artists/102',
          join: '',
          anv: '',
          role: 'Featured',
          tracks: '',
        },
      ],
    },
    {
      position: '2',
      title: 'Test Track 2',
      duration: '4:20',
      type_: 'track',
    },
  ],
  genres: ['Test Genre'],
  styles: ['Test Style'],
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
  data_quality: 'Correct',
  videos: [
    {
      uri: 'https://www.youtube.com/watch?v=test',
      title: 'Test Video',
      description: 'Test video description',
      duration: 180,
      embed: true,
    },
  ],
};

describe('MasterReleaseService', () => {
  let service: MasterReleaseService;

  beforeEach(() => {
    service = new MasterReleaseService();
  });

  describe('get', () => {
    it('should return a validated master release object', async () => {
      (service as any).request.mockResolvedValueOnce(mockMasterRelease);

      const result = await service.get({ master_id: 123 });

      expect(result).toEqual(mockMasterRelease);
      expect(service['request']).toHaveBeenCalledWith('/123');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ master_id: 999 })).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.get({ master_id: 999 })).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidMaster = { ...mockMasterRelease, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidMaster);

      await expect(service.get({ master_id: 999 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.get({ master_id: 999 })).rejects.toThrow(
        'Failed to get master release:',
      );
    });
  });
});
