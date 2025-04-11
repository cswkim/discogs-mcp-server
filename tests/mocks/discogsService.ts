import { vi } from 'vitest';

// Mock the DiscogsService class
vi.mock('../../src/services/index', async () => {
  const actual = await vi.importActual<any>('../../src/services/index');
  return {
    ...actual,
    DiscogsService: class {
      request = vi.fn();
    },
  };
});

// Reset the mock before each test
export const resetDiscogsServiceMock = () => {
  vi.clearAllMocks();
};
