import { type FastMCP, type Tool, imageContent } from 'fastmcp';
import { z } from 'zod';
import { formatDiscogsError } from '../errors.js';
import { FastMCPSessionAuth } from '../types/common.js';

const MediaParamsSchema = z.object({
  url: z.string().url(),
});

/**
 * MCP tool for fetching an image
 */
export const fetchImageTool: Tool<FastMCPSessionAuth, typeof MediaParamsSchema> = {
  name: 'fetch_image',
  description: 'Fetch an image by URL',
  parameters: MediaParamsSchema,
  execute: async ({ url }) => {
    try {
      return imageContent({ url });
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerMediaTools(server: FastMCP): void {
  server.addTool(fetchImageTool);
}
