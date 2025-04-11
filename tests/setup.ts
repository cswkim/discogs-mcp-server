import dotenv from 'dotenv';
import { afterEach, beforeAll } from 'vitest';
import { resetDiscogsServiceMock } from './mocks/discogsService';

// Load test environment variables
beforeAll(() => {
  dotenv.config({ path: '.env.test' });
});

// Reset all mocks after each test
afterEach(() => {
  resetDiscogsServiceMock();
});
