import { type FastMCP, type Tool, UserError, imageContent } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { FastMCPSessionAuth } from '../types/common.js';

// Allowed image CDN hosts for Discogs media
const ALLOWED_IMAGE_HOSTS = ['img.discogs.com', 'i.discogs.com', 'st.discogs.com'];

// Private/reserved IP ranges that should never be fetched
const PRIVATE_IP_PATTERNS = [
  /^127\./, // loopback
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^0\./, // 0.0.0.0/8
  /^169\.254\./, // link-local
  /^::1$/, // IPv6 loopback
  /^fd/, // IPv6 unique-local
  /^fe80:/, // IPv6 link-local
];

function isPrivateHost(hostname: string): boolean {
  return hostname === 'localhost' || PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

/**
 * Validates that a URL is safe for image fetching:
 * - Must use HTTPS
 * - Must be from an allowed Discogs CDN host
 * - Must not target private/internal networks
 */
function validateImageUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UserError(`Invalid URL: ${url}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new UserError(`Image URLs must use HTTPS. Got: ${parsed.protocol}`);
  }

  if (isPrivateHost(parsed.hostname)) {
    throw new UserError(`Image URLs must not target private/internal addresses.`);
  }

  if (!ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) {
    throw new UserError(
      `Image host "${parsed.hostname}" is not allowed. ` +
        `Allowed hosts: ${ALLOWED_IMAGE_HOSTS.join(', ')}`,
    );
  }
}

const MediaParamsSchema = z.object({
  url: z.string().url(),
});

/**
 * MCP tool for fetching an image
 */
export const fetchImageTool: Tool<FastMCPSessionAuth, typeof MediaParamsSchema> = {
  name: 'fetch_image',
  description:
    'Fetch an image by URL. Only HTTPS URLs from Discogs image CDNs are allowed ' +
    '(img.discogs.com, i.discogs.com, st.discogs.com).',
  parameters: MediaParamsSchema,
  execute: async ({ url }) => {
    try {
      validateImageUrl(url);
      return imageContent({ url });
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerMediaTools(server: FastMCP, _options?: { readOnly?: boolean }): void {
  server.addTool(fetchImageTool);
}
