import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { ArtistBasicSchema } from './artist.js';
import {
  FilteredResponseSchema,
  PaginatedResponseSchema,
  QueryParamsSchema,
  StatusSchema,
} from './common.js';
import { ReleaseSchema } from './release.js';

/**
 * Schema for a master release ID parameter
 */
export const MasterReleaseIdParamSchema = z.object({
  master_id: z.number().int(),
});

/**
 * Schema for a master release versions parameter
 */
export const MasterReleaseVersionsParamSchema = MasterReleaseIdParamSchema.extend({
  format: z.string().optional(),
  label: z.string().optional(),
  released: z.string().optional(),
  country: z.string().optional(),
}).merge(QueryParamsSchema(['released', 'title', 'format', 'label', 'catno', 'country']));

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

const MasterReleaseVersionItemSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  country: z.string(),
  title: z.string(),
  major_formats: z.array(z.string()),
  format: z.string(),
  catno: z.string(),
  released: z.string(),
  status: StatusSchema,
  resource_url: urlOrEmptySchema(),
  thumb: urlOrEmptySchema().optional(),
  stats: z.object({
    community: z
      .object({
        in_wantlist: z.number().int(),
        in_collection: z.number().int(),
      })
      .optional(),
    user: z
      .object({
        in_wantlist: z.number().int(),
        in_collection: z.number().int(),
      })
      .optional(),
  }),
});

export const MasterReleaseVersionsResponseSchema = z.object({
  ...PaginatedResponseSchema(MasterReleaseVersionItemSchema, 'versions').shape,
  ...FilteredResponseSchema.shape,
});

/**
 * TypeScript type for a master release
 */
export type MasterRelease = z.infer<typeof MasterReleaseSchema>;

/**
 * TypeScript type for a master release ID parameter
 */
export type MasterReleaseIdParam = z.infer<typeof MasterReleaseIdParamSchema>;

/**
 * TypeScript type for a master release versions parameter
 */
export type MasterReleaseVersionsParam = z.infer<typeof MasterReleaseVersionsParamSchema>;

/**
 * TypeScript type for a master release versions response
 */
export type MasterReleaseVersionsResponse = z.infer<typeof MasterReleaseVersionsResponseSchema>;
