import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';

/**
 * Schema for basic artist information
 */
export const ArtistBasicSchema = z.object({
  id: z.number(),
  anv: z.string(),
  join: z.string(),
  name: z.string(),
  resource_url: urlOrEmptySchema(),
  role: z.string(),
  tracks: z.string(),
});

/**
 * TypeScript type for basic artist information
 */
export type ArtistBasic = z.infer<typeof ArtistBasicSchema>;
