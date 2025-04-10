import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { ArtistReleaseSchema } from './artist.js';
import { PaginatedResponseSchema, QueryParamsSchema } from './common.js';

/**
 * Schema for a label ID parameter
 */
export const LabelIdParamSchema = z.object({
  label_id: z.number(),
});

/**
 * Schema for basic label information
 */
export const LabelBasicSchema = z.object({
  id: z.number(),
  catno: z.string(),
  entity_type: z.string().optional(),
  entity_type_name: z.string().optional(),
  name: z.string(),
  resource_url: urlOrEmptySchema(),
});

/**
 * Schema for complete label information
 */
export const LabelSchema = z.object({
  id: z.number(),
  contact_info: z.string().optional(),
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
  name: z.string(),
  parent_label: z
    .object({
      id: z.number(),
      name: z.string(),
      resource_url: urlOrEmptySchema(),
    })
    .optional(),
  profile: z.string().optional(),
  releases_url: urlOrEmptySchema().optional(),
  resource_url: urlOrEmptySchema(),
  sublabels: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        resource_url: urlOrEmptySchema(),
      }),
    )
    .optional(),
  uri: urlOrEmptySchema().optional(),
  urls: z.array(z.string()).optional(),
});

/**
 * Schema for label releases parameters
 */
export const LabelReleasesParamsSchema = LabelIdParamSchema.merge(QueryParamsSchema());

/**
 * Schema for label releases
 */
export const LabelReleasesSchema = PaginatedResponseSchema(ArtistReleaseSchema, 'releases');

/**
 * TypeScript type for a label ID parameter
 */
export type LabelIdParam = z.infer<typeof LabelIdParamSchema>;

/**
 * TypeScript type for basic label information
 */
export type LabelBasic = z.infer<typeof LabelBasicSchema>;

/**
 * TypeScript type for a complete label
 */
export type Label = z.infer<typeof LabelSchema>;

/**
 * TypeScript type for label releases parameters
 */
export type LabelReleasesParams = z.infer<typeof LabelReleasesParamsSchema>;

/**
 * TypeScript type for label releases
 */
export type LabelReleases = z.infer<typeof LabelReleasesSchema>;
