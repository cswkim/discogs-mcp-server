import { z } from 'zod';

/**
 * Schema for a user's collection value statistics
 */
export const UserCollectionValueSchema = z.object({
  maximum: z.string(),
  median: z.string(),
  minimum: z.string(),
});

/**
 * TypeScript type for a Discogs user's collection value statistics
 */
export type UserCollectionValue = z.infer<typeof UserCollectionValueSchema>;
