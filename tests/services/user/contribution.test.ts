// Mock imports need to go before all other imports
import '../../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import {
  UserContributionsService,
  UserSubmissionsService,
} from '../../../src/services/user/contribution';
import type {
  ContributionsResponse,
  SubmissionResponse,
} from '../../../src/types/user/contribution';

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

// Mock contributions response
const mockContributionsResponse: ContributionsResponse = {
  pagination: {
    page: 1,
    per_page: 50,
    pages: 2,
    items: 75,
    urls: {
      first: 'https://api.discogs.com/users/testuser/contributions?page=1',
      next: 'https://api.discogs.com/users/testuser/contributions?page=2',
      last: 'https://api.discogs.com/users/testuser/contributions?page=2',
    },
  },
  contributions: [],
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

describe('UserContributionsService', () => {
  let service: UserContributionsService;

  beforeEach(() => {
    service = new UserContributionsService();
  });

  describe('get', () => {
    it('should return a validated contributions response', async () => {
      (service as any).request.mockResolvedValueOnce(mockContributionsResponse);

      const result = await service.get({ username: 'testuser' });

      expect(result).toEqual(mockContributionsResponse);
      expect(service['request']).toHaveBeenCalledWith('/testuser/contributions', {
        params: {},
      });
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
        ...mockContributionsResponse,
        contributions: [{ invalid: 'data' }],
      };
      (service as any).request.mockResolvedValueOnce(invalidResponse);

      await expect(service.get({ username: 'testuser' })).rejects.toThrow();
    });

    it('should pass query parameters to the request', async () => {
      (service as any).request.mockResolvedValueOnce(mockContributionsResponse);

      const params = {
        username: 'testuser',
        page: 2,
        per_page: 25,
        sort: 'artist' as const,
        sort_order: 'desc' as const,
      };

      await service.get(params);

      expect(service['request']).toHaveBeenCalledWith('/testuser/contributions', {
        params: {
          page: 2,
          per_page: 25,
          sort: 'artist',
          sort_order: 'desc',
        },
      });
    });
  });
});
