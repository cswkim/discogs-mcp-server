import { vi } from 'vitest';

// Mock the DiscogsService class
vi.mock('../../src/services/index', async () => {
  const actual = await vi.importActual<any>('../../src/services/index');
  return {
    ...actual,
    DiscogsService: class {
      request = vi.fn();
    },
    BaseUserService: class {
      request = vi.fn();
    },
  };
});
