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

  describe('getExports', () => {
    it('should return a validated inventory exports response', async () => {
      const mockExportsResponse = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {
            first: 'https://api.discogs.com/inventory/export?page=1',
            prev: undefined,
            next: undefined,
            last: 'https://api.discogs.com/inventory/export?page=1',
          },
        },
        items: [
          {
            id: 123,
            status: 'Finished',
            created_ts: '2024-01-01T00:00:00Z',
            url: 'https://api.discogs.com/inventory/export/123',
            finished_ts: '2024-01-01T00:01:00Z',
            download_url: 'https://api.discogs.com/inventory/export/123/download',
            filename: 'inventory_20240101.csv',
          },
        ],
      };

      (service as any).request.mockResolvedValueOnce(mockExportsResponse);

      const result = await service.getExports();

      expect(result).toEqual(mockExportsResponse);
      expect(service['request']).toHaveBeenCalledWith('/export');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getExports()).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle validation errors properly', async () => {
      const invalidResponse = {
        pagination: {
          page: 1,
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {},
        },
        items: [{ invalid: 'data' }],
      };
      (service as any).request.mockResolvedValueOnce(invalidResponse);

      await expect(service.getExports()).rejects.toThrow();
    });
  });

  describe('getExport', () => {
    it('should return a validated inventory export item', async () => {
      const mockExportItem = {
        id: 123,
        status: 'Finished',
        created_ts: '2024-01-01T00:00:00Z',
        url: 'https://api.discogs.com/inventory/export/123',
        finished_ts: '2024-01-01T00:01:00Z',
        download_url: 'https://api.discogs.com/inventory/export/123/download',
        filename: 'inventory_20240101.csv',
      };

      (service as any).request.mockResolvedValueOnce(mockExportItem);

      const result = await service.getExport({ id: 123 });

      expect(result).toEqual(mockExportItem);
      expect(service['request']).toHaveBeenCalledWith('/export/123');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getExport({ id: 123 })).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getExport({ id: 123 })).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidResponse = {
        id: 123,
        status: 'Finished',
        // Missing required fields
      };
      (service as any).request.mockResolvedValueOnce(invalidResponse);

      await expect(service.getExport({ id: 123 })).rejects.toThrow();
    });
  });

  describe('downloadExport', () => {
    it('should return the inventory export as a CSV', async () => {
      const mockCsv = 'id,title,artist\n1,Album,Artist';
      (service as any).request.mockResolvedValueOnce(mockCsv);

      const result = await service.downloadExport({ id: 123 });

      expect(result).toBe(mockCsv);
      expect(service['request']).toHaveBeenCalledWith('/export/123/download');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.downloadExport({ id: 123 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.downloadExport({ id: 123 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle unexpected errors properly', async () => {
      const error = new Error('Unexpected error');
      (service as any).request.mockRejectedValueOnce(error);

      await expect(service.downloadExport({ id: 123 })).rejects.toThrow(
        'Failed to download inventory export',
      );
    });
  });
});
