import dotenv from 'dotenv';
import { afterEach, vi } from 'vitest';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
