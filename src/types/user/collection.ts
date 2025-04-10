import { z } from 'zod';
import { PaginatedResponseSchema, QueryParamsSchema, UsernameInputSchema } from '../common.js';
import { BasicInformationSchema, ReleaseIdParamSchema } from '../release.js';

/**
 * Schema for a folder_id parameter with optional minimum value
 * @param min Optional minimum value for the folder_id
 */
export const FolderIdParamSchema = (min?: number) =>
  z.object({
    folder_id: z
      .number()
      .int()
      .min(min ?? 0),
  });

/**
 * Schema for a Discogs user collection folder
 */
export const UserCollectionFolderSchema = z.object({
  id: z.number(),
  count: z.number(),
  name: z.string(),
  resource_url: z.string().url(),
});

/**
 * Schema for a Discogs user collection folders response
 */
export const UserCollectionFoldersSchema = z.object({
  folders: z.array(UserCollectionFolderSchema),
});

/**
 * Schema for a Discogs user collection folder create parameters
 */
export const UserCollectionFolderCreateParamsSchema = UsernameInputSchema.extend({
  name: z.string().optional(),
});

/**
 * Schema for a Discogs user collection folder get/edit/delete parameters
 */
export const UserCollectionFolderParamsSchema =
  UserCollectionFolderCreateParamsSchema.merge(FolderIdParamSchema());

/**
 * Schema for a Discogs user collection folder release parameters
 */
export const UserCollectionFolderReleaseParamsSchema = UsernameInputSchema.merge(
  FolderIdParamSchema(1).merge(ReleaseIdParamSchema),
);

/**
 * Schema for a Discogs user collection items parameters
 */
export const UserCollectionItemsParamsSchema = UsernameInputSchema.merge(
  FolderIdParamSchema().merge(
    QueryParamsSchema([
      'added',
      'artist',
      'catno',
      'format',
      'label',
      'rating',
      'title',
      'year',
    ] as const),
  ),
);

/**
 * Schema for a Discogs user collection release added
 */
export const UserCollectionReleaseAddedSchema = z.object({
  instance_id: z.number().int(),
  resource_url: z.string().url(),
});

/**
 * Schema for a Discogs user collection release parameters
 */
export const UserCollectionReleaseParamsSchema = UsernameInputSchema.merge(
  ReleaseIdParamSchema.merge(QueryParamsSchema()),
);

/**
 * Schema for a Discogs user collection release deleted parameters
 */
export const UserCollectionReleaseDeletedParamsSchema =
  UserCollectionFolderReleaseParamsSchema.extend({
    instance_id: z.number().int(),
  });

/**
 * Schema for a Discogs user collection release item
 */
export const UserCollectionReleaseItemSchema = z.object({
  id: z.number(),
  instance_id: z.number(),
  basic_information: BasicInformationSchema,
  date_added: z.string().optional(),
  folder_id: z.number(),
  notes: z
    .array(
      z.object({
        field_id: z.number(),
        value: z.string(),
      }),
    )
    .optional(),
  rating: z.number().int().optional(),
});

/**
 * Schema for a Discogs user collection release rating parameters
 */
export const UserCollectionReleaseRatingParamsSchema =
  UserCollectionReleaseDeletedParamsSchema.extend({
    rating: z.number().int().min(1).max(5).optional(),
  });

/**
 * Schema for releases in a user's collection
 */
export const UserCollectionItemsByReleaseSchema = PaginatedResponseSchema(
  UserCollectionReleaseItemSchema,
  'releases',
);

/**
 * Schema for a user's collection value statistics
 */
export const UserCollectionValueSchema = z.object({
  maximum: z.string(),
  median: z.string(),
  minimum: z.string(),
});

/**
 * TypeScript type for a Discogs user collection folder
 */
export type UserCollectionFolder = z.infer<typeof UserCollectionFolderSchema>;

/**
 * TypeScript type for a Discogs user collection folder create parameters
 */
export type UserCollectionFolderCreateParams = z.infer<
  typeof UserCollectionFolderCreateParamsSchema
>;

/**
 * TypeScript type for a Discogs user collection folder get/edit/delete parameters
 */
export type UserCollectionFolderParams = z.infer<typeof UserCollectionFolderParamsSchema>;

/**
 * TypeScript type for a Discogs user collection folder release parameters
 */
export type UserCollectionFolderReleaseParams = z.infer<
  typeof UserCollectionFolderReleaseParamsSchema
>;

/**
 * TypeScript type for a Discogs user collection folders response
 */
export type UserCollectionFolders = z.infer<typeof UserCollectionFoldersSchema>;

/**
 * TypeScript type for a Discogs user collection items parameters
 */
export type UserCollectionItemsParams = z.infer<typeof UserCollectionItemsParamsSchema>;

/**
 * TypeScript type for a Discogs user collection release added
 */
export type UserCollectionReleaseAdded = z.infer<typeof UserCollectionReleaseAddedSchema>;

/**
 * TypeScript type for a Discogs user collection release parameters
 */
export type UserCollectionReleaseParams = z.infer<typeof UserCollectionReleaseParamsSchema>;

/**
 * TypeScript type for a Discogs user collection release deleted parameters
 */
export type UserCollectionReleaseDeletedParams = z.infer<
  typeof UserCollectionReleaseDeletedParamsSchema
>;

/**
 * TypeScript type for a Discogs user collection release item
 */
export type UserCollectionReleaseItem = z.infer<typeof UserCollectionReleaseItemSchema>;

/**
 * TypeScript type for a Discogs user collection release rating parameters
 */
export type UserCollectionReleaseRatingParams = z.infer<
  typeof UserCollectionReleaseRatingParamsSchema
>;

/**
 * TypeScript type for a Discogs user's collection items by release
 */
export type UserCollectionItemsByRelease = z.infer<typeof UserCollectionItemsByReleaseSchema>;

/**
 * TypeScript type for a Discogs user's collection value statistics
 */
export type UserCollectionValue = z.infer<typeof UserCollectionValueSchema>;
