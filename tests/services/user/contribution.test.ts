// Mock imports need to go before all other imports
import '../../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { UserSubmissionsService } from '../../../src/services/user/contribution';
import type { SubmissionResponse } from '../../../src/types/user/contribution';

// Mock submissions response
const mockSubmissionsResponse: SubmissionResponse = {
  pagination: {
    page: 1,
    per_page: 50,
    pages: 2,
    items: 75,
    urls: {
      first: 'https://api.discogs.com/users/testuser/submissions?page=1',
      next: 'https://api.discogs.com/users/testuser/submissions?page=2',
      last: 'https://api.discogs.com/users/testuser/submissions?page=2',
    },
  },
  submissions: {
    artists: [],
    labels: [],
    releases: [],
  },
};

describe('UserSubmissionsService', () => {
  let service: UserSubmissionsService;

  beforeEach(() => {
    service = new UserSubmissionsService();
  });

  describe('get', () => {
    it('should return a validated submissions response', async () => {
      (service as any).request.mockResolvedValueOnce(mockSubmissionsResponse);

      const result = await service.get({ username: 'testuser' });

      expect(result).toEqual(mockSubmissionsResponse);
      expect(service['request']).toHaveBeenCalledWith('/testuser/submissions');
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
      const invalidResponse = {
        ...mockSubmissionsResponse,
        submissions: {
          artists: [{ invalid: 'data' }],
        },
      };
      (service as any).request.mockResolvedValueOnce(invalidResponse);

      await expect(service.get({ username: 'testuser' })).rejects.toThrow();
    });
  });
});
