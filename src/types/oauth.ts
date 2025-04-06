import { z } from 'zod';

/**
 * Zod schema for Discogs Identity response
 */
export const DiscogsIdentitySchema = z.object({
  id: z.number(),
  username: z.string(),
  resource_url: z.string().url(),
  consumer_name: z.string(),
});

/**
 * TypeScript type for Discogs Identity, derived from Zod schema
 */
export type DiscogsIdentity = z.infer<typeof DiscogsIdentitySchema>;
