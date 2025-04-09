import { z } from 'zod';
import { UsernameInputSchema } from '../common.js';

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
export const UserCollectionFolderParamsSchema = UserCollectionFolderCreateParamsSchema.extend({
  folder_id: z.number(),
});

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
 * TypeScript type for a Discogs user collection folders response
 */
export type UserCollectionFolders = z.infer<typeof UserCollectionFoldersSchema>;

/**
 * TypeScript type for a Discogs user's collection value statistics
 */
export type UserCollectionValue = z.infer<typeof UserCollectionValueSchema>;
