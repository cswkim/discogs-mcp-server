import { z } from 'zod';

/**
 * Schema for a Discogs user identity
 */
export const DiscogsUserIdentitySchema = z.object({
  id: z.number(),
  username: z.string(),
  resource_url: z.string().url(),
  consumer_name: z.string(),
});

/**
 * TypeScript type for a Discogs user identity
 */
export type DiscogsUserIdentity = z.infer<typeof DiscogsUserIdentitySchema>;
