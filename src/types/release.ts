import { z } from 'zod';
import { ArtistBasicSchema } from './artist.js';
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
  cover_image: z.string().urlOrEmpty(),
  formats: z.array(ReleaseFormatSchema),
  genres: z.array(z.string()).optional(),
  master_id: z.number().optional(),
  master_url: z.string().urlOrEmpty().optional(),
  labels: z.array(LabelBasicSchema),
  resource_url: z.string().urlOrEmpty(),
  styles: z.array(z.string()).optional(),
  thumb: z.string().urlOrEmpty(),
  title: z.string(),
  year: z.number(),
});

/**
 * Schema for a release_id parameter
 */
export const ReleaseIdParamSchema = z.object({
  release_id: z.number().min(1, 'The release_id must be non-zero'),
});

/**
 * TypeScript type for basic release information
 */
export type BasicInformation = z.infer<typeof BasicInformationSchema>;

/**
 * TypeScript type for a release format
 */
export type ReleaseFormat = z.infer<typeof ReleaseFormatSchema>;

/**
 * TypeScript type for a release_id parameter
 */
export type ReleaseIdParam = z.infer<typeof ReleaseIdParamSchema>;
