// Mock imports need to go before all other imports
import '../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { InventoryService } from '../../src/services/inventory';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
  });

  describe('export', () => {
    it('should successfully export inventory', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.export();

      expect(service['request']).toHaveBeenCalledWith('/export', {
        method: 'POST',
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.export()).rejects.toThrow('DiscogsAuthenticationError');
    });
  });
});
