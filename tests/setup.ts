import dotenv from 'dotenv';
import { afterEach, beforeAll, vi } from 'vitest';
import './mocks/discogsService';

// Load test environment variables
beforeAll(() => {
  dotenv.config({ path: '.env.test' });
});

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
