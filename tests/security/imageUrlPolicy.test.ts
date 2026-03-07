import { describe, expect, it, vi } from 'vitest';

// Mock imageContent so it doesn't actually fetch
vi.mock('fastmcp', async () => {
  const actual = await vi.importActual<typeof import('fastmcp')>('fastmcp');
  return {
    ...actual,
    imageContent: vi.fn().mockResolvedValue({
      content: [{ type: 'image', data: 'mock', mimeType: 'image/jpeg' }],
    }),
  };
});

import { fetchImageTool } from '../../src/tools/media.js';

describe('Security: Image URL policy', () => {
  const execute = fetchImageTool.execute;
  const context = { log: console, session: undefined, reportProgress: async () => {} } as never;

  it('allows HTTPS URLs from img.discogs.com', async () => {
    await expect(
      execute({ url: 'https://img.discogs.com/test.jpg' }, context),
    ).resolves.toBeDefined();
  });

  it('allows HTTPS URLs from i.discogs.com', async () => {
    await expect(
      execute({ url: 'https://i.discogs.com/test.jpg' }, context),
    ).resolves.toBeDefined();
  });

  it('allows HTTPS URLs from st.discogs.com', async () => {
    await expect(
      execute({ url: 'https://st.discogs.com/test.jpg' }, context),
    ).resolves.toBeDefined();
  });

  it('rejects HTTP URLs', async () => {
    await expect(execute({ url: 'http://img.discogs.com/test.jpg' }, context)).rejects.toThrow(
      'must use HTTPS',
    );
  });

  it('rejects non-Discogs hosts', async () => {
    await expect(
      execute({ url: 'https://evil.example.com/tracking.gif' }, context),
    ).rejects.toThrow('not allowed');
  });

  it('rejects localhost URLs', async () => {
    await expect(execute({ url: 'https://localhost/internal.jpg' }, context)).rejects.toThrow(
      'private',
    );
  });

  it('rejects private IP range 127.x', async () => {
    await expect(execute({ url: 'https://127.0.0.1/internal.jpg' }, context)).rejects.toThrow(
      'private',
    );
  });

  it('rejects private IP range 10.x', async () => {
    await expect(execute({ url: 'https://10.0.0.1/internal.jpg' }, context)).rejects.toThrow(
      'private',
    );
  });

  it('rejects private IP range 192.168.x', async () => {
    await expect(execute({ url: 'https://192.168.1.1/internal.jpg' }, context)).rejects.toThrow(
      'private',
    );
  });

  it('rejects invalid URL', async () => {
    await expect(execute({ url: 'not-a-url' }, context)).rejects.toThrow('Invalid URL');
  });
});
