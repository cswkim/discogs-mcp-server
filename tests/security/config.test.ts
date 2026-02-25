import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('Security: Config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      DISCOGS_PERSONAL_ACCESS_TOKEN: 'test-token',
      DISCOGS_API_URL: 'https://api.discogs.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('accepts valid Discogs API URL', async () => {
    process.env.DISCOGS_API_URL = 'https://api.discogs.com';
    const { validateConfig } = await import('../../src/config.js');
    expect(() => validateConfig()).not.toThrow();
  });

  it('rejects HTTP (non-HTTPS) API URL', async () => {
    process.env.DISCOGS_API_URL = 'http://api.discogs.com';
    const { validateConfig } = await import('../../src/config.js');
    expect(() => validateConfig()).toThrow('must use HTTPS');
  });

  it('rejects non-Discogs API host', async () => {
    process.env.DISCOGS_API_URL = 'https://evil.example.com';
    const { validateConfig } = await import('../../src/config.js');
    expect(() => validateConfig()).toThrow('not in the allowed list');
  });

  it('rejects invalid URL', async () => {
    process.env.DISCOGS_API_URL = 'not-a-url';
    const { validateConfig } = await import('../../src/config.js');
    expect(() => validateConfig()).toThrow('not a valid URL');
  });

  it('rejects missing DISCOGS_PERSONAL_ACCESS_TOKEN', async () => {
    delete process.env.DISCOGS_PERSONAL_ACCESS_TOKEN;
    const { validateConfig } = await import('../../src/config.js');
    expect(() => validateConfig()).toThrow('DISCOGS_PERSONAL_ACCESS_TOKEN');
  });

  it('defaults SERVER_HOST to 127.0.0.1', async () => {
    delete process.env.SERVER_HOST;
    const { config } = await import('../../src/config.js');
    expect(config.server.host).toBe('127.0.0.1');
  });

  it('reads READONLY_MODE from env', async () => {
    process.env.READONLY_MODE = 'true';
    const { config } = await import('../../src/config.js');
    expect(config.server.readOnly).toBe(true);
  });

  it('defaults READONLY_MODE to false', async () => {
    delete process.env.READONLY_MODE;
    const { config } = await import('../../src/config.js');
    expect(config.server.readOnly).toBe(false);
  });
});
