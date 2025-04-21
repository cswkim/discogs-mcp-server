// Mock imports need to go before all other imports
import '../../mocks/discogsService';

import { beforeEach, describe, expect, it } from 'vitest';
import { UserCollectionService } from '../../../src/services/user/collection';
import type {
  UserCollectionCustomFields,
  UserCollectionFolder,
  UserCollectionFolders,
  UserCollectionItemsByRelease,
  UserCollectionReleaseAdded,
  UserCollectionValue,
} from '../../../src/types/user';

// Mock collection folders data
const mockCollectionFolders: UserCollectionFolders = {
  folders: [
    {
      id: 1,
      name: 'All',
      count: 100,
      resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
    },
    {
      id: 2,
      name: 'Uncategorized',
      count: 50,
      resource_url: 'https://api.discogs.com/users/testuser/collection/folders/2',
    },
  ],
};

// Mock collection folder data
const mockCollectionFolder: UserCollectionFolder = {
  id: 1,
  name: 'Test Folder',
  count: 10,
  resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
};

// Mock collection items by release data
const mockCollectionItemsByRelease: UserCollectionItemsByRelease = {
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    items: 1,
    urls: {
      last: 'https://api.discogs.com/users/example/collection/releases/123?page=1&per_page=50',
      next: 'https://api.discogs.com/users/example/collection/releases/123?page=1&per_page=50',
    },
  },
  releases: [
    {
      id: 123,
      instance_id: 456,
      folder_id: 1,
      date_added: '2024-01-01T00:00:00Z',
      rating: 5,
      basic_information: {
        id: 123,
        title: 'Test Release',
        year: 2024,
        resource_url: 'https://api.discogs.com/releases/123',
        artists: [
          {
            id: 1,
            name: 'Test Artist',
            resource_url: 'https://api.discogs.com/artists/1',
            join: ', ',
            anv: '',
            role: 'Main',
            tracks: '',
          },
        ],
        labels: [
          {
            id: 1,
            name: 'Test Label',
            resource_url: 'https://api.discogs.com/labels/1',
            catno: 'TEST001',
          },
        ],
        formats: [
          {
            name: 'Vinyl',
            qty: '1',
            descriptions: ['LP', 'Album'],
          },
        ],
        genres: ['Rock'],
        styles: ['Alternative'],
        thumb: 'https://example.com/thumb.jpg',
        cover_image: 'https://example.com/cover.jpg',
        master_id: 202,
        master_url: 'https://api.discogs.com/masters/202',
      },
    },
  ],
};

// Mock collection value data
const mockCollectionValue: UserCollectionValue = {
  minimum: '100.00',
  median: '150.00',
  maximum: '200.00',
};

// Mock collection custom fields data
const mockCollectionCustomFields: UserCollectionCustomFields = {
  fields: [
    {
      id: 1,
      name: 'Condition',
      type: 'dropdown',
      position: 1,
      public: true,
      lines: 1,
      options: [
        'Mint',
        'Near Mint',
        'Very Good Plus',
        'Very Good',
        'Good Plus',
        'Good',
        'Fair',
        'Poor',
      ],
    },
    {
      id: 2,
      name: 'Notes',
      type: 'text',
      position: 2,
      public: false,
      lines: 5,
    },
  ],
};

// Mock collection release added data
const mockCollectionReleaseAdded: UserCollectionReleaseAdded = {
  instance_id: 456,
  resource_url: 'https://api.discogs.com/users/testuser/collection/releases/123/instances/456',
};

describe('UserCollectionService', () => {
  let service: UserCollectionService;

  beforeEach(() => {
    service = new UserCollectionService();
  });

  describe('getFolders', () => {
    it('should return a validated collection folders object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionFolders);

      const result = await service.getFolders({ username: 'testuser' });

      expect(result).toEqual(mockCollectionFolders);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getFolders({ username: 'testuser' })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getFolders({ username: 'nonexistent' })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidFolders = {
        folders: [
          {
            id: 'not-a-number',
            name: 'Test Folder',
            count: 10,
            resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
          },
        ],
      };
      (service as any).request.mockResolvedValueOnce(invalidFolders);

      await expect(service.getFolders({ username: 'testuser' })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getFolders({ username: 'testuser' })).rejects.toThrow(
        'Failed to get collection folders:',
      );
    });
  });

  describe('getFolder', () => {
    it('should return a validated collection folder object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionFolder);

      const result = await service.getFolder({ username: 'testuser', folder_id: 1 });

      expect(result).toEqual(mockCollectionFolder);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders/1');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getFolder({ username: 'testuser', folder_id: 1 })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getFolder({ username: 'nonexistent', folder_id: 1 })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidFolder = {
        id: 'not-a-number',
        name: 'Test Folder',
        count: 10,
        resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
      };
      (service as any).request.mockResolvedValueOnce(invalidFolder);

      await expect(service.getFolder({ username: 'testuser', folder_id: 1 })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getFolder({ username: 'testuser', folder_id: 1 })).rejects.toThrow(
        'Failed to get folder:',
      );
    });
  });

  describe('findRelease', () => {
    it('should return a validated UserCollectionItemsByRelease object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionItemsByRelease);

      const result = await service.findRelease({
        username: 'testuser',
        release_id: 123,
        per_page: 50,
      });

      expect(result).toEqual(mockCollectionItemsByRelease);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/releases/123', {
        params: { per_page: 50 },
      });
    });

    it('should handle authentication errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.findRelease({ username: 'testuser', release_id: 123, per_page: 50 }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle permission errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.findRelease({ username: 'testuser', release_id: 123, per_page: 50 }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle resource not found errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.findRelease({ username: 'testuser', release_id: 123, per_page: 50 }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.findRelease({ username: 'testuser', release_id: 123, per_page: 50 }),
      ).rejects.toThrow('Failed to find release in collection:');
    });
  });

  describe('getValue', () => {
    it('should return a validated collection value object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionValue);

      const result = await service.getValue({ username: 'testuser' });

      expect(result).toEqual(mockCollectionValue);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/value');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getValue({ username: 'testuser' })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getValue({ username: 'nonexistent' })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidValue = {
        minimum: 'not-a-number',
        median: 150.0,
        maximum: 200.0,
      };
      (service as any).request.mockResolvedValueOnce(invalidValue);

      await expect(service.getValue({ username: 'testuser' })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getValue({ username: 'testuser' })).rejects.toThrow(
        'Failed to get collection value:',
      );
    });
  });

  describe('getCustomFields', () => {
    it('should return a validated collection custom fields object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionCustomFields);

      const result = await service.getCustomFields({ username: 'testuser' });

      expect(result).toEqual(mockCollectionCustomFields);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/fields');
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getCustomFields({ username: 'testuser' })).rejects.toThrow(
        'DiscogsAuthenticationError',
      );
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(service.getCustomFields({ username: 'nonexistent' })).rejects.toThrow(
        'DiscogsResourceNotFoundError',
      );
    });

    it('should handle validation errors properly', async () => {
      const invalidFields = {
        fields: [
          {
            id: 'not-a-number',
            name: 'Condition',
            type: 'dropdown',
            position: 1,
            public: true,
            options: [
              'Mint',
              'Near Mint',
              'Very Good Plus',
              'Very Good',
              'Good Plus',
              'Good',
              'Fair',
              'Poor',
            ],
          },
        ],
      };
      (service as any).request.mockResolvedValueOnce(invalidFields);

      await expect(service.getCustomFields({ username: 'testuser' })).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(service.getCustomFields({ username: 'testuser' })).rejects.toThrow(
        'Failed to get collection custom fields:',
      );
    });
  });

  describe('addReleaseToFolder', () => {
    it('should return a validated collection release added object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionReleaseAdded);

      const result = await service.addReleaseToFolder({
        username: 'testuser',
        folder_id: 1,
        release_id: 123,
      });

      expect(result).toEqual(mockCollectionReleaseAdded);
      expect(service['request']).toHaveBeenCalledWith(
        '/testuser/collection/folders/1/releases/123',
        {
          method: 'POST',
        },
      );
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.addReleaseToFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.addReleaseToFolder({
          username: 'otheruser',
          folder_id: 1,
          release_id: 123,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.addReleaseToFolder({
          username: 'nonexistent',
          folder_id: 1,
          release_id: 123,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidRelease = {
        instance_id: 'not-a-number',
        resource_url:
          'https://api.discogs.com/users/testuser/collection/releases/123/instances/456',
      };
      (service as any).request.mockResolvedValueOnce(invalidRelease);

      await expect(
        service.addReleaseToFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.addReleaseToFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
        }),
      ).rejects.toThrow('Failed to add release to folder:');
    });
  });

  describe('createFolder', () => {
    it('should create a new folder and return a validated folder object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionFolder);

      const result = await service.createFolder({
        username: 'testuser',
        name: 'Test Folder',
      });

      expect(result).toEqual(mockCollectionFolder);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders', {
        method: 'POST',
        body: { name: 'Test Folder' },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createFolder({
          username: 'testuser',
          name: 'Test Folder',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createFolder({
          username: 'otheruser',
          name: 'Test Folder',
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createFolder({
          username: 'nonexistent',
          name: 'Test Folder',
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidFolder = {
        id: 'not-a-number',
        name: 'Test Folder',
        count: 10,
        resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
      };
      (service as any).request.mockResolvedValueOnce(invalidFolder);

      await expect(
        service.createFolder({
          username: 'testuser',
          name: 'Test Folder',
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.createFolder({
          username: 'testuser',
          name: 'Test Folder',
        }),
      ).rejects.toThrow('Failed to create folder:');
    });

    it('should handle empty folder name', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createFolder({
          username: 'testuser',
          name: '',
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle long folder name', async () => {
      const longName = 'a'.repeat(256);
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.createFolder({
          username: 'testuser',
          name: longName,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('deleteFolder', () => {
    it('should delete an empty folder successfully', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.deleteFolder({
        username: 'testuser',
        folder_id: 2,
      });

      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders/2', {
        method: 'DELETE',
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteFolder({
          username: 'testuser',
          folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteFolder({
          username: 'otheruser',
          folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteFolder({
          username: 'nonexistent',
          folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle non-empty folder deletion errors', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteFolder({
          username: 'testuser',
          folder_id: 1,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.deleteFolder({
          username: 'testuser',
          folder_id: 2,
        }),
      ).rejects.toThrow('Failed to delete folder:');
    });

    it('should prevent deletion of system folders', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteFolder({
          username: 'testuser',
          folder_id: 0,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid folder IDs', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteFolder({
          username: 'testuser',
          folder_id: -1,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('editFolder', () => {
    it('should edit folder metadata successfully', async () => {
      const updatedFolder = {
        ...mockCollectionFolder,
        name: 'Updated Test Folder',
      };
      (service as any).request.mockResolvedValueOnce(updatedFolder);

      const result = await service.editFolder({
        username: 'testuser',
        folder_id: 2,
        name: 'Updated Test Folder',
      });

      expect(result).toEqual(updatedFolder);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders/2', {
        method: 'POST',
        body: { name: 'Updated Test Folder' },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editFolder({
          username: 'testuser',
          folder_id: 2,
          name: 'Updated Test Folder',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editFolder({
          username: 'otheruser',
          folder_id: 2,
          name: 'Updated Test Folder',
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editFolder({
          username: 'nonexistent',
          folder_id: 2,
          name: 'Updated Test Folder',
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should prevent editing system folders', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editFolder({
          username: 'testuser',
          folder_id: 0,
          name: 'Updated Test Folder',
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle validation errors properly', async () => {
      const invalidFolder = {
        id: 'not-a-number',
        name: 'Updated Test Folder',
        count: 10,
        resource_url: 'https://api.discogs.com/users/testuser/collection/folders/1',
      };
      (service as any).request.mockResolvedValueOnce(invalidFolder);

      await expect(
        service.editFolder({
          username: 'testuser',
          folder_id: 2,
          name: 'Updated Test Folder',
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.editFolder({
          username: 'testuser',
          folder_id: 2,
          name: 'Updated Test Folder',
        }),
      ).rejects.toThrow('Failed to edit folder:');
    });

    it('should handle empty folder name', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editFolder({
          username: 'testuser',
          folder_id: 2,
          name: '',
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle long folder name', async () => {
      const longName = 'a'.repeat(256);
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editFolder({
          username: 'testuser',
          folder_id: 2,
          name: longName,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('getItems', () => {
    it('should return a validated collection items object', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionItemsByRelease);

      const result = await service.getItems({
        username: 'testuser',
        folder_id: 1,
        page: 1,
        per_page: 50,
      });

      expect(result).toEqual(mockCollectionItemsByRelease);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders/1/releases', {
        params: { page: 1, per_page: 50 },
      });
    });

    it('should handle sorting and filtering options', async () => {
      (service as any).request.mockResolvedValueOnce(mockCollectionItemsByRelease);

      const result = await service.getItems({
        username: 'testuser',
        folder_id: 1,
        sort: 'artist',
        sort_order: 'desc',
      });

      expect(result).toEqual(mockCollectionItemsByRelease);
      expect(service['request']).toHaveBeenCalledWith('/testuser/collection/folders/1/releases', {
        params: { sort: 'artist', sort_order: 'desc' },
      });
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getItems({
          username: 'testuser',
          folder_id: 1,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getItems({
          username: 'otheruser',
          folder_id: 1,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getItems({
          username: 'nonexistent',
          folder_id: 1,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const invalidItems = {
        pagination: {
          page: 'not-a-number',
          pages: 1,
          per_page: 50,
          items: 1,
          urls: {},
        },
        releases: [],
      };
      (service as any).request.mockResolvedValueOnce(invalidItems);

      await expect(
        service.getItems({
          username: 'testuser',
          folder_id: 1,
        }),
      ).rejects.toThrow();
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.getItems({
          username: 'testuser',
          folder_id: 1,
        }),
      ).rejects.toThrow('Failed to get collection items:');
    });

    it('should handle invalid folder IDs', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getItems({
          username: 'testuser',
          folder_id: -1,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid pagination parameters', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.getItems({
          username: 'testuser',
          folder_id: 1,
          page: 0,
          per_page: 0,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('moveRelease', () => {
    it('should move a release between folders successfully', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.moveRelease({
        username: 'testuser',
        folder_id: 1,
        release_id: 123,
        instance_id: 456,
        destination_folder_id: 2,
      });

      expect(service['request']).toHaveBeenCalledWith(
        '/testuser/collection/folders/1/releases/123/instances/456',
        {
          method: 'POST',
          body: { folder_id: 2 },
        },
      );
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'otheruser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'nonexistent',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: 0,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.moveRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: 2,
        }),
      ).rejects.toThrow('Failed to move release:');
    });

    it('should handle invalid source folder ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'testuser',
          folder_id: -1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid target folder ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          destination_folder_id: -1,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid release ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.moveRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: -1,
          instance_id: 456,
          destination_folder_id: 2,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('rateRelease', () => {
    it('should rate a release successfully', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.rateRelease({
        username: 'testuser',
        folder_id: 1,
        release_id: 123,
        instance_id: 456,
        rating: 5,
      });

      expect(service['request']).toHaveBeenCalledWith(
        '/testuser/collection/folders/1/releases/123/instances/456',
        {
          method: 'POST',
          body: { rating: 5 },
        },
      );
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'otheruser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'nonexistent',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          rating: 6,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.rateRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          rating: 5,
        }),
      ).rejects.toThrow('Failed to rate release:');
    });

    it('should handle invalid folder ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'testuser',
          folder_id: -1,
          release_id: 123,
          instance_id: 456,
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid release ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: -1,
          instance_id: 456,
          rating: 5,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid rating value', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.rateRelease({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          rating: 0,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('deleteReleaseFromFolder', () => {
    it('should delete a release from a folder successfully', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.deleteReleaseFromFolder({
        username: 'testuser',
        folder_id: 1,
        release_id: 123,
        instance_id: 456,
      });

      expect(service['request']).toHaveBeenCalledWith(
        '/testuser/collection/folders/1/releases/123/instances/456',
        {
          method: 'DELETE',
        },
      );
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'otheruser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'nonexistent',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'testuser',
          folder_id: 0,
          release_id: 123,
          instance_id: 456,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      (service as any).request.mockRejectedValueOnce(networkError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
        }),
      ).rejects.toThrow('Failed to delete release from folder:');
    });

    it('should handle invalid folder ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'testuser',
          folder_id: -1,
          release_id: 123,
          instance_id: 456,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid release ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: -1,
          instance_id: 456,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });

    it('should handle invalid instance ID', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.deleteReleaseFromFolder({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: -1,
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });

  describe('editCustomFieldValue', () => {
    it('should edit a custom field value successfully', async () => {
      (service as any).request.mockResolvedValueOnce(undefined);

      await service.editCustomFieldValue({
        username: 'testuser',
        folder_id: 1,
        release_id: 123,
        instance_id: 456,
        field_id: 1,
        value: 'Mint',
      });

      expect(service['request']).toHaveBeenCalledWith(
        '/testuser/collection/folders/1/releases/123/instances/456/fields/1',
        {
          method: 'POST',
          body: { value: 'Mint' },
        },
      );
    });

    it('should handle Discogs authentication errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsAuthenticationError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editCustomFieldValue({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          field_id: 1,
          value: 'Mint',
        }),
      ).rejects.toThrow('DiscogsAuthenticationError');
    });

    it('should handle Discogs permission errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsPermissionError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editCustomFieldValue({
          username: 'otheruser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          field_id: 1,
          value: 'Mint',
        }),
      ).rejects.toThrow('DiscogsPermissionError');
    });

    it('should handle Discogs resource not found errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsResourceNotFoundError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editCustomFieldValue({
          username: 'nonexistent',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          field_id: 1,
          value: 'Mint',
        }),
      ).rejects.toThrow('DiscogsResourceNotFoundError');
    });

    it('should handle validation errors properly', async () => {
      const discogsError = new Error('Discogs API Error');
      discogsError.name = 'DiscogsValidationFailedError';
      (service as any).request.mockRejectedValueOnce(discogsError);

      await expect(
        service.editCustomFieldValue({
          username: 'testuser',
          folder_id: 1,
          release_id: 123,
          instance_id: 456,
          field_id: 1,
          value: 'Yada Yada',
        }),
      ).rejects.toThrow('DiscogsValidationFailedError');
    });
  });
});
