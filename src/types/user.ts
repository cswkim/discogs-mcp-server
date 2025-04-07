import { z } from 'zod';

/**
 * Schema for a Discogs user profile
 * The email field is optional and only present when viewing your own profile
 * Some fields like num_collection, num_wantlist, and num_unread are optional
 * and may not be present in all responses
 */
export const UserProfileSchema = z.object({
  id: z.number(),
  resource_url: z.string().url(),
  uri: z.string().url(),
  username: z.string(),
  name: z.string(),
  home_page: z.string(),
  location: z.string(),
  profile: z.string(),
  registered: z.string(),
  rank: z.number(),
  num_pending: z.number(),
  num_for_sale: z.number(),
  num_lists: z.number(),
  releases_contributed: z.number(),
  releases_rated: z.number(),
  rating_avg: z.number(),
  inventory_url: z.string().url(),
  collection_folders_url: z.string().url(),
  collection_fields_url: z.string().url(),
  wantlist_url: z.string().url(),
  avatar_url: z.string().url(),
  curr_abbr: z.string(),
  activated: z.boolean(),
  marketplace_suspended: z.boolean(),
  banner_url: z.string(),
  buyer_rating: z.number(),
  buyer_rating_stars: z.number(),
  buyer_num_ratings: z.number(),
  seller_rating: z.number(),
  seller_rating_stars: z.number(),
  seller_num_ratings: z.number(),
  is_staff: z.boolean(),
  // Optional fields that may appear in some responses
  email: z.string().email().optional(),
  num_collection: z.number().optional(),
  num_wantlist: z.number().optional(),
  num_unread: z.number().optional(),
});

/**
 * Schema for a Discogs user profile input
 */
export const UserProfileInputSchema = z.object({
  username: z.string().min(1, 'username is required'),
});

/**
 * TypeScript type for a Discogs user profile
 */
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * TypeScript type for a Discogs user profile input
 */
export type UserProfileInput = z.infer<typeof UserProfileInputSchema>;
