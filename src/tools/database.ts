import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { ReleaseService } from '../services/release.js';
import { ReleaseParamsSchema } from '../types/release.js';

/**
 * MCP tool for fetching a Discogs release
 */
const getReleaseTool: Tool<undefined, typeof ReleaseParamsSchema> = {
  name: 'get_release',
  description: 'Get a release',
  parameters: ReleaseParamsSchema,
  execute: async (args) => {
    try {
      const releaseService = new ReleaseService();
      const release = await releaseService.get(args);

      return JSON.stringify(release);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerDatabaseTools(server: FastMCP): void {
  server.addTool(getReleaseTool);
}
