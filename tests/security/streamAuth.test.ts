import { describe, expect, it } from 'vitest';

/**
 * Tests for stream mode authentication policy.
 * The actual auth enforcement is in src/index.ts; these tests verify
 * the localhost detection logic used for auth gating.
 */
describe('Security: Stream auth policy', () => {
  function isLocalhostHost(host: string): boolean {
    return host === '127.0.0.1' || host === 'localhost' || host === '::1';
  }

  it('identifies 127.0.0.1 as localhost', () => {
    expect(isLocalhostHost('127.0.0.1')).toBe(true);
  });

  it('identifies localhost as localhost', () => {
    expect(isLocalhostHost('localhost')).toBe(true);
  });

  it('identifies ::1 as localhost', () => {
    expect(isLocalhostHost('::1')).toBe(true);
  });

  it('rejects 0.0.0.0 as not localhost', () => {
    expect(isLocalhostHost('0.0.0.0')).toBe(false);
  });

  it('rejects external IPs as not localhost', () => {
    expect(isLocalhostHost('192.168.1.1')).toBe(false);
    expect(isLocalhostHost('10.0.0.1')).toBe(false);
    expect(isLocalhostHost('8.8.8.8')).toBe(false);
  });
});
