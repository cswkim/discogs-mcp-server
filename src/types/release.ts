import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { ArtistBasicSchema } from './artist.js';
import { CurrencyCodeSchema, UsernameInputSchema } from './common.js';
import { LabelBasicSchema } from './label.js';

/**
 * Schema for a release format
 */
export const ReleaseFormatSchema = z.object({
  descriptions: z.array(z.string()).optional(),
  name: z.string(),
  qty: z.string(),
  text: z.string().optional(),
});

/**
 * Schema for basic release information
 */
export const BasicInformationSchema = z.object({
  id: z.number(),
  artists: z.array(ArtistBasicSchema),
  cover_image: urlOrEmptySchema(),
  formats: z.array(ReleaseFormatSchema),
  genres: z.array(z.string()).optional(),
  master_id: z.number().optional(),
  master_url: urlOrEmptySchema().nullable().optional(),
  labels: z.array(LabelBasicSchema),
  resource_url: urlOrEmptySchema(),
  styles: z.array(z.string()).optional(),
  thumb: urlOrEmptySchema(),
  title: z.string(),
  year: z.number(),
});

/**
 * Schema for a complete release
 */
export const ReleaseSchema = z.object({
  id: z.number().int(),
  artists_sort: z.string().optional(),
  artists: z.array(ArtistBasicSchema),
  blocked_from_sale: z.boolean().optional(),
  companies: z
    .array(
      z.object({
        id: z.number().int().optional(),
        catno: z.string().optional(),
        entity_type: z.string().optional(),
        entity_type_name: z.string().optional(),
        name: z.string().optional(),
        resource_url: urlOrEmptySchema().optional(),
        thumbnail_url: urlOrEmptySchema().optional(),
      }),
    )
    .optional(),
  community: z
    .object({
      contributors: z
        .array(
          z.object({
            resource_url: urlOrEmptySchema().optional(),
            username: z.string().optional(),
          }),
        )
        .optional(),
      data_quality: z.string().optional(),
      have: z.number().int().optional(),
      rating: z
        .object({
          average: z.number().optional(),
          count: z.number().int().optional(),
        })
        .optional(),
      status: z.string().optional(),
      submitter: z
        .object({
          resource_url: urlOrEmptySchema().optional(),
          username: z.string().optional(),
        })
        .optional(),
      want: z.number().int().optional(),
    })
    .optional(),
  country: z.string().optional(),
  data_quality: z.string().optional(),
  date_added: z.string().optional(),
  date_changed: z.string().optional(),
  estimated_weight: z.number().int().optional(),
  extraartists: z.array(ArtistBasicSchema).optional(),
  format_quantity: z.number().int().optional(),
  formats: z.array(ReleaseFormatSchema).optional(),
  genres: z.array(z.string()).optional(),
  identifiers: z
    .array(
      z.object({
        type: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  images: z
    .array(
      z.object({
        height: z.number().int().optional(),
        width: z.number().int().optional(),
        resource_url: urlOrEmptySchema(),
        type: z.string().optional(),
        uri: urlOrEmptySchema().optional(),
        uri150: urlOrEmptySchema().optional(),
      }),
    )
    .optional(),
  labels: z.array(LabelBasicSchema).optional(),
  lowest_price: z.number().optional(),
  master_id: z.number().optional(),
  master_url: urlOrEmptySchema().optional(),
  notes: z.string().optional(),
  num_for_sale: z.number().int().optional(),
  released: z.string().optional(),
  released_formatted: z.string().optional(),
  resource_url: urlOrEmptySchema(),
  series: z.array(z.unknown()).optional(),
  status: z.string().optional(),
  styles: z.array(z.string()).optional(),
  thumb: urlOrEmptySchema().optional(),
  title: z.string(),
  tracklist: z
    .array(
      z.object({
        duration: z.string().optional(),
        position: z.string(),
        title: z.string(),
        type_: z.string().optional(),
      }),
    )
    .optional(),
  uri: urlOrEmptySchema().optional(),
  videos: z
    .array(
      z.object({
        description: z.string().optional(),
        duration: z.number().int().optional(),
        embed: z.boolean().optional(),
        title: z.string().optional(),
        uri: urlOrEmptySchema().optional(),
      }),
    )
    .optional(),
  year: z.number(),
});

/**
 * Schema for a release_id parameter
 */
export const ReleaseIdParamSchema = z.object({
  release_id: z.number().min(1, 'The release_id must be non-zero'),
});

/**
 * Schema for release parameters
 */
export const ReleaseParamsSchema = ReleaseIdParamSchema.extend({
  curr_abbr: CurrencyCodeSchema.optional(),
});

/**
 * Schema for release rating
 */
export const ReleaseRatingSchema = UsernameInputSchema.merge(ReleaseIdParamSchema).extend({
  rating: z.number(),
});

/**
 * Schema for release rating community
 */
export const ReleaseRatingCommunitySchema = ReleaseIdParamSchema.extend({
  rating: z.object({
    average: z.number(),
    count: z.number().int(),
  }),
});

/**
 * Schema for release rating parameters
 */
export const ReleaseRatingParamsSchema = UsernameInputSchema.merge(ReleaseIdParamSchema);

/**
 * Schema for release rating edit parameters
 */
export const ReleaseRatingEditParamsSchema = ReleaseRatingParamsSchema.extend({
  rating: z
    .number()
    .int()
    .min(1, 'The rating must be at least 1')
    .max(5, 'The rating must be at most 5'),
});

/**
 * TypeScript type for basic release information
 */
export type BasicInformation = z.infer<typeof BasicInformationSchema>;

/**
 * TypeScript type for a complete release
 */
export type Release = z.infer<typeof ReleaseSchema>;

/**
 * TypeScript type for a release format
 */
export type ReleaseFormat = z.infer<typeof ReleaseFormatSchema>;

/**
 * TypeScript type for a release_id parameter
 */
export type ReleaseIdParam = z.infer<typeof ReleaseIdParamSchema>;

/**
 * TypeScript type for release parameters
 */
export type ReleaseParams = z.infer<typeof ReleaseParamsSchema>;

/**
 * TypeScript type for release rating
 */
export type ReleaseRating = z.infer<typeof ReleaseRatingSchema>;

/**
 * TypeScript type for release rating community
 */
export type ReleaseRatingCommunity = z.infer<typeof ReleaseRatingCommunitySchema>;

/**
 * TypeScript type for release rating parameters
 */
export type ReleaseRatingParams = z.infer<typeof ReleaseRatingParamsSchema>;

/**
 * TypeScript type for release rating edit parameters
 */
export type ReleaseRatingEditParams = z.infer<typeof ReleaseRatingEditParamsSchema>;
