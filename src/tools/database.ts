import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { MasterReleaseService } from '../services/master.js';
import { ReleaseService } from '../services/release.js';
import { MasterReleaseIdParamSchema } from '../types/master.js';
import {
  ReleaseIdParamSchema,
  ReleaseParamsSchema,
  ReleaseRatingEditParamsSchema,
  ReleaseRatingParamsSchema,
} from '../types/release.js';

/**
 * MCP tool for deleting a release rating
 */
const deleteReleaseRatingTool: Tool<undefined, typeof ReleaseRatingParamsSchema> = {
  name: 'delete_release_rating',
  description: `Deletes the release's rating for a given user`,
  parameters: ReleaseRatingParamsSchema,
  execute: async (args) => {
    try {
      const releaseService = new ReleaseService();
      await releaseService.deleteRatingByUser(args);

      return 'Release rating deleted successfully';
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for editing a release rating
 */
const editReleaseRatingTool: Tool<undefined, typeof ReleaseRatingEditParamsSchema> = {
  name: 'edit_release_rating',
  description: `Updates the release's rating for a given user`,
  parameters: ReleaseRatingEditParamsSchema,
  execute: async (args) => {
    try {
      const releaseService = new ReleaseService();
      const releaseRating = await releaseService.editRatingByUser(args);

      return JSON.stringify(releaseRating);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs master release
 */
const getMasterReleaseTool: Tool<undefined, typeof MasterReleaseIdParamSchema> = {
  name: 'get_master_release',
  description: 'Get a master release',
  parameters: MasterReleaseIdParamSchema,
  execute: async (args) => {
    try {
      const masterReleaseService = new MasterReleaseService();
      const masterRelease = await masterReleaseService.get(args);

      return JSON.stringify(masterRelease);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

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

/**
 * MCP tool for fetching a Discogs release community rating
 */
const getReleaseCommunityRatingTool: Tool<undefined, typeof ReleaseIdParamSchema> = {
  name: 'get_release_community_rating',
  description: 'Retrieves the release community rating average and count',
  parameters: ReleaseIdParamSchema,
  execute: async (args) => {
    try {
      const releaseService = new ReleaseService();
      const releaseRating = await releaseService.getCommunityRating(args);

      return JSON.stringify(releaseRating);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs release rating by user
 */
const getReleaseRatingTool: Tool<undefined, typeof ReleaseRatingParamsSchema> = {
  name: 'get_release_rating_by_user',
  description: `Retrieves the release's rating for a given user`,
  parameters: ReleaseRatingParamsSchema,
  execute: async (args) => {
    try {
      const releaseService = new ReleaseService();
      const releaseRating = await releaseService.getRatingByUser(args);

      return JSON.stringify(releaseRating);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerDatabaseTools(server: FastMCP): void {
  server.addTool(getReleaseTool);
  server.addTool(getReleaseRatingTool);
  server.addTool(editReleaseRatingTool);
  server.addTool(deleteReleaseRatingTool);
  server.addTool(getReleaseCommunityRatingTool);
  server.addTool(getMasterReleaseTool);
}
