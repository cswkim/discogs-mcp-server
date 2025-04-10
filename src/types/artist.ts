import { z } from 'zod';

/**
 * Schema for basic artist information
 */
export const ArtistBasicSchema = z.object({
  id: z.number(),
  anv: z.string(),
  join: z.string(),
  name: z.string(),
  resource_url: z.string().urlOrEmpty(),
  role: z.string(),
  tracks: z.string(),
});

/**
 * TypeScript type for basic artist information
 */
export type ArtistBasic = z.infer<typeof ArtistBasicSchema>;
