import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { ArtistService } from '../services/artist.js';
import { DatabaseService } from '../services/database.js';
import { LabelService } from '../services/label.js';
import { MasterReleaseService } from '../services/master.js';
import { ReleaseService } from '../services/release.js';
import { ArtistIdParamSchema, ArtistReleasesParamsSchema } from '../types/artist.js';
import { SearchParamsSchema } from '../types/database.js';
import { LabelIdParamSchema, LabelReleasesParamsSchema } from '../types/label.js';
import { MasterReleaseIdParamSchema, MasterReleaseVersionsParamSchema } from '../types/master.js';
import {
  ReleaseIdParamSchema,
  ReleaseParamsSchema,
  ReleaseRatingEditParamsSchema,
  ReleaseRatingParamsSchema,
} from '../types/release.js';

/**
 * MCP tool for deleting a release rating
 */
export const deleteReleaseRatingTool: Tool<undefined, typeof ReleaseRatingParamsSchema> = {
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
export const editReleaseRatingTool: Tool<undefined, typeof ReleaseRatingEditParamsSchema> = {
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
 * MCP tool for fetching a Discogs artist
 */
export const getArtistTool: Tool<undefined, typeof ArtistIdParamSchema> = {
  name: 'get_artist',
  description: 'Get an artist',
  parameters: ArtistIdParamSchema,
  execute: async (args) => {
    try {
      const artistService = new ArtistService();
      const artist = await artistService.get(args);

      return JSON.stringify(artist);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs artist releases
 */
export const getArtistReleasesTool: Tool<undefined, typeof ArtistReleasesParamsSchema> = {
  name: 'get_artist_releases',
  description: `Get an artist's releases`,
  parameters: ArtistReleasesParamsSchema,
  execute: async (args) => {
    try {
      const artistService = new ArtistService();
      const artistReleases = await artistService.getReleases(args);

      return JSON.stringify(artistReleases);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs label
 */
export const getLabelTool: Tool<undefined, typeof LabelIdParamSchema> = {
  name: 'get_label',
  description: 'Get a label',
  parameters: LabelIdParamSchema,
  execute: async (args) => {
    try {
      const labelService = new LabelService();
      const label = await labelService.get(args);

      return JSON.stringify(label);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs label releases
 */
export const getLabelReleasesTool: Tool<undefined, typeof LabelReleasesParamsSchema> = {
  name: 'get_label_releases',
  description: 'Returns a list of Releases associated with the label',
  parameters: LabelReleasesParamsSchema,
  execute: async (args) => {
    try {
      const labelService = new LabelService();
      const labelReleases = await labelService.getReleases(args);

      return JSON.stringify(labelReleases);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs master release
 */
export const getMasterReleaseTool: Tool<undefined, typeof MasterReleaseIdParamSchema> = {
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
 * MCP tool for fetching Discogs master release versions
 */
export const getMasterReleaseVersionsTool: Tool<
  undefined,
  typeof MasterReleaseVersionsParamSchema
> = {
  name: 'get_master_release_versions',
  description: 'Retrieves a list of all Releases that are versions of this master',
  parameters: MasterReleaseVersionsParamSchema,
  execute: async (args) => {
    try {
      const masterReleaseService = new MasterReleaseService();
      const masterReleaseVersions = await masterReleaseService.getVersions(args);

      return JSON.stringify(masterReleaseVersions);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs release
 */
export const getReleaseTool: Tool<undefined, typeof ReleaseParamsSchema> = {
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
export const getReleaseCommunityRatingTool: Tool<undefined, typeof ReleaseIdParamSchema> = {
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
export const getReleaseRatingTool: Tool<undefined, typeof ReleaseRatingParamsSchema> = {
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

/**
 * MCP tool for searching the Discogs database
 */
export const searchTool: Tool<undefined, typeof SearchParamsSchema> = {
  name: 'search',
  description: 'Issue a search query to the Discogs database',
  parameters: SearchParamsSchema,
  execute: async (args) => {
    try {
      const databaseService = new DatabaseService();
      const searchResults = await databaseService.search(args);

      return JSON.stringify(searchResults);
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
  server.addTool(getMasterReleaseVersionsTool);
  server.addTool(getArtistTool);
  server.addTool(getArtistReleasesTool);
  server.addTool(getLabelTool);
  server.addTool(getLabelReleasesTool);
  server.addTool(searchTool);
}
