import type { AuthCredentials } from './types.js';

/**
 * Singleton storage for authentication credentials
 * Initialized lazily on first API request
 */
let authCredentials: AuthCredentials | null = null;

/**
 * Promise for in-progress initialization to prevent concurrent init attempts
 */
let initPromise: Promise<AuthCredentials> | null = null;

/**
 * Sets the authentication credentials for the application
 *
 * @param credentials - The resolved authentication credentials
 */
export function setAuthCredentials(credentials: AuthCredentials): void {
  authCredentials = credentials;
}

/**
 * Gets the current authentication credentials
 * Used by services to build API request headers
 *
 * @returns The authentication credentials
 * @throws Error if credentials haven't been set
 */
export function getAuthCredentials(): AuthCredentials {
  if (!authCredentials) {
    throw new Error('Authentication credentials not initialized. Call ensureAuth() first.');
  }
  return authCredentials;
}

/**
 * Checks if authentication credentials have been set
 */
export function hasAuthCredentials(): boolean {
  return authCredentials !== null;
}

/**
 * Ensures authentication is initialized before making API requests
 * This is idempotent - subsequent calls return immediately if already initialized
 *
 * @returns Promise resolving to the authentication credentials
 */
export async function ensureAuth(): Promise<AuthCredentials> {
  // Already initialized
  if (authCredentials) {
    return authCredentials;
  }

  // Initialization in progress - wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization - dynamic import to avoid circular dependency
  const { initializeAuth } = await import('./index.js');
  initPromise = initializeAuth();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}
