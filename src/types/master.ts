import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { ArtistBasicSchema } from './artist.js';
import { ReleaseSchema } from './release.js';

/**
 * Schema for a master release ID parameter
 */
export const MasterReleaseIdParamSchema = z.object({
  master_id: z.number().int(),
});

/**
 * Schema for a master release
 * Extends the base ReleaseSchema with master-specific fields
 */
export const MasterReleaseSchema = ReleaseSchema.extend({
  main_release: z.number(),
  most_recent_release: z.number(),
  versions_url: urlOrEmptySchema(),
  main_release_url: urlOrEmptySchema(),
  most_recent_release_url: urlOrEmptySchema(),
  tracklist: z
    .array(
      z.object({
        position: z.string(),
        type_: z.string().optional(),
        title: z.string(),
        duration: z.string().optional(),
        extraartists: z.array(ArtistBasicSchema).optional(),
      }),
    )
    .optional(),
  artists: z.array(
    ArtistBasicSchema.extend({
      thumbnail_url: urlOrEmptySchema().optional(),
    }),
  ),
});

/**
 * TypeScript type for a master release
 */
export type MasterRelease = z.infer<typeof MasterReleaseSchema>;

/**
 * TypeScript type for a master release ID parameter
 */
export type MasterReleaseIdParam = z.infer<typeof MasterReleaseIdParamSchema>;
