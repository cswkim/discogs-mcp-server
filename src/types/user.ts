import { z } from 'zod';
import { CurrencyCodeSchema, PaginatedResponseSchema, QueryParamsSchema } from './common.js';
import { BasicInformationSchema, ReleaseIdParamSchema } from './release.js';

/**
 * Schema for a user's collection value statistics
 */
export const UserCollectionValueSchema = z.object({
  maximum: z.string(),
  median: z.string(),
  minimum: z.string(),
});

/**
 * Schema for a username input
 */
export const UsernameInputSchema = z.object({
  username: z.string().min(1, 'username is required'),
});

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
 * Schema for editing a Discogs user profile
 */
export const UserProfileEditInputSchema = z.object({
  ...UsernameInputSchema.shape,
  name: z.string().optional(),
  home_page: z
    .string()
    .refine(
      (val) =>
        val === '' ||
        val.toLowerCase().startsWith('http://') ||
        val.toLowerCase().startsWith('https://'),
      'invalid URL - must start with http:// or https://',
    )
    .optional(),
  location: z.string().optional(),
  profile: z.string().optional(),
  curr_abbr: CurrencyCodeSchema.optional(),
});

/**
 * Valid sort keys for user wantlist
 */
type WantlistSortKeys = ['added', 'artist', 'label', 'rating', 'title', 'year'];

/**
 * Schema for wantlist query parameters
 */
export const UserWantlistParamsSchema =
  UsernameInputSchema.merge(QueryParamsSchema<WantlistSortKeys>());

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
 * Schema for a user's list item
 */
export const UserListItemSchema = z.object({
  id: z.number(),
  date_added: z.string(),
  date_changed: z.string(),
  description: z.string().optional(),
  name: z.string(),
  public: z.boolean(),
  resource_url: z.string().url(),
  uri: z.string().url(),
});

/**
 * Valid sort keys for user lists
 */
type ListsSortKeys = ['date_added', 'date_changed', 'name'];

/**
 * Schema for lists query parameters
 */
export const UserListsParamsSchema = UsernameInputSchema.merge(QueryParamsSchema<ListsSortKeys>());

/**
 * Schema for paginated user lists response
 */
export const UserListsSchema = PaginatedResponseSchema(UserListItemSchema, 'lists');

/**
 * TypeScript type for a username input
 */
export type UsernameInput = z.infer<typeof UsernameInputSchema>;

/**
 * TypeScript type for a Discogs user profile
 */
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * TypeScript type for a Discogs user profile edit input
 */
export type UserProfileEditInput = z.infer<typeof UserProfileEditInputSchema>;

/**
 * TypeScript type for a Discogs user's collection value statistics
 */
export type UserCollectionValue = z.infer<typeof UserCollectionValueSchema>;

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

/**
 * Type for a user's list item
 */
export type UserListItem = z.infer<typeof UserListItemSchema>;

/**
 * TypeScript type for lists query parameters
 */
export type UserListsParams = z.infer<typeof UserListsParamsSchema>;

/**
 * Type for paginated user lists response
 */
export type UserLists = z.infer<typeof UserListsSchema>;
