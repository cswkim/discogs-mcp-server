import { z } from 'zod';

/**
 * Zod schema for Discogs Identity response
 */
export const DiscogsUserIdentitySchema = z.object({
  id: z.number(),
  username: z.string(),
  resource_url: z.string().url(),
  consumer_name: z.string(),
});

/**
 * TypeScript type for Discogs Identity, derived from Zod schema
 */
export type DiscogsUserIdentity = z.infer<typeof DiscogsUserIdentitySchema>;
