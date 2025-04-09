import { z } from 'zod';
import { PaginatedResponseSchema, QueryParamsSchema, UsernameInputSchema } from '../common.js';
import { BasicInformationSchema, ReleaseIdParamSchema } from '../release.js';

/**
 * Schema for wantlist query parameters
 */
export const UserWantlistParamsSchema = UsernameInputSchema.merge(
  QueryParamsSchema(['added', 'artist', 'label', 'rating', 'title', 'year'] as const),
);

/**
 * Schema for a wantlist item
 */
export const UserWantlistItemSchema = z.object({
  id: z.number(),
  basic_information: BasicInformationSchema,
  notes: z.string().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  resource_url: z.string().url(),
});

/**
 * Schema for a Discogs user wantlist
 */
export const UserWantlistSchema = PaginatedResponseSchema(UserWantlistItemSchema, 'wants');

/**
 * Schema for adding or editing a release in a user's wantlist
 */
export const UserWantlistItemParamsSchema = UsernameInputSchema.merge(
  ReleaseIdParamSchema.extend({
    notes: z.string().optional(),
    rating: z.number().int().min(0).max(5).optional(),
  }),
);

/**
 * TypeScript type for a Discogs user wantlist
 */
export type UserWantlist = z.infer<typeof UserWantlistSchema>;

/**
 * TypeScript type for wantlist query parameters
 */
export type UserWantlistParams = z.infer<typeof UserWantlistParamsSchema>;

/**
 * TypeScript type for a wantlist item
 */
export type UserWantlistItem = z.infer<typeof UserWantlistItemSchema>;

/**
 * TypeScript type for adding or editing a release in a user's wantlist
 */
export type UserWantlistItemParams = z.infer<typeof UserWantlistItemParamsSchema>;
