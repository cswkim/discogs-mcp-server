import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { PaginatedResponseSchema, QueryParamsSchema } from './common.js';

/**
 * Schema for an artist ID parameter
 */
export const ArtistIdParamSchema = z.object({
  artist_id: z.number(),
});

/**
 * Schema for basic artist information
 */
export const ArtistBasicSchema = z.object({
  id: z.number(),
  anv: z.string(),
  join: z.string(),
  name: z.string(),
  resource_url: urlOrEmptySchema(),
  role: z.string(),
  tracks: z.string(),
});

/**
 * Schema for complete artist information
 */
export const ArtistSchema = z.object({
  id: z.number(),
  aliases: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        resource_url: urlOrEmptySchema(),
        thumbnail_url: urlOrEmptySchema().optional(),
      }),
    )
    .optional(),
  data_quality: z.string().optional(),
  images: z
    .array(
      z.object({
        height: z.number().int().optional(),
        resource_url: urlOrEmptySchema(),
        type: z.string().optional(),
        uri: urlOrEmptySchema(),
        uri150: urlOrEmptySchema().optional(),
        width: z.number().int().optional(),
      }),
    )
    .optional(),
  members: z
    .array(
      z.object({
        id: z.number(),
        active: z.boolean().optional(),
        name: z.string(),
        resource_url: urlOrEmptySchema(),
        thumbnail_url: urlOrEmptySchema().optional(),
      }),
    )
    .optional(),
  name: z.string(),
  namevariations: z.array(z.string()).optional(),
  profile: z.string().optional(),
  realname: z.string().optional(),
  releases_url: urlOrEmptySchema().optional(),
  resource_url: urlOrEmptySchema(),
  uri: urlOrEmptySchema().optional(),
  urls: z.array(z.string()).optional(),
});

/**
 * Schema for an artist release
 */
const ArtistReleaseSchema = z.object({
  id: z.number(),
  artist: z.string(),
  format: z.string().optional(),
  label: z.string().optional(),
  main_release: z.number().optional(),
  resource_url: urlOrEmptySchema(),
  role: z.string(),
  status: z.string().optional(),
  stats: z
    .object({
      community: z.object({
        in_collection: z.number(),
        in_wantlist: z.number(),
      }),
      user: z.object({
        in_collection: z.number(),
        in_wantlist: z.number(),
      }),
    })
    .optional(),
  thumb: urlOrEmptySchema().optional(),
  title: z.string(),
  trackinfo: z.string().optional(),
  type: z.string(),
  year: z.number().optional(),
});

/**
 * Schema for artist releases parameters
 */
export const ArtistReleasesParamsSchema = ArtistIdParamSchema.merge(
  QueryParamsSchema(['year', 'title', 'format'] as const),
);

/**
 * Schema for artist releases
 */
export const ArtistReleasesSchema = PaginatedResponseSchema(ArtistReleaseSchema, 'releases');

/**
 * TypeScript type for an artist ID parameter
 */
export type ArtistIdParam = z.infer<typeof ArtistIdParamSchema>;

/**
 * TypeScript type for basic artist information
 */
export type ArtistBasic = z.infer<typeof ArtistBasicSchema>;

/**
 * TypeScript type for a complete artist
 */
export type Artist = z.infer<typeof ArtistSchema>;

/**
 * TypeScript type for artist releases parameters
 */
export type ArtistReleasesParams = z.infer<typeof ArtistReleasesParamsSchema>;

/**
 * TypeScript type for artist releases
 */
export type ArtistReleases = z.infer<typeof ArtistReleasesSchema>;
