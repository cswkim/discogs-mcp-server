// Mock imports need to go before all other imports
import '../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { OAuthService } from '../../src/services/oauth';
import type { DiscogsUserIdentity } from '../../src/types/oauth';

// Mock user identity data
const mockUserIdentity: DiscogsUserIdentity = {
  id: 123,
  username: 'testuser',
  resource_url: 'https://api.discogs.com/users/testuser',
  consumer_name: 'Test Consumer',
};

describe('OAuthService', () => {
  let service: OAuthService;

  beforeEach(() => {
    service = new OAuthService();
  });

  describe('getUserIdentity', () => {
    it('should return a validated user identity object', async () => {
      (service as any).request.mockResolvedValueOnce(mockUserIdentity);

      const result = await service.getUserIdentity();

      expect(result).toEqual(mockUserIdentity);
      expect(service['request']).toHaveBeenCalledWith('/identity');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getUserIdentity()).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle validation errors properly', async () => {
      const invalidIdentity = { ...mockUserIdentity, id: 'not-a-number' };
      (service as any).request.mockResolvedValueOnce(invalidIdentity);

      await expect(service.getUserIdentity()).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getUserIdentity()).rejects.toThrow('Failed to get identity:');
    });
  });
});
