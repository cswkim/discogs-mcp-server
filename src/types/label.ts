import { z } from 'zod';

/**
 * Schema for basic label information
 */
export const LabelBasicSchema = z.object({
  id: z.number(),
  catno: z.string(),
  entity_type: z.string(),
  name: z.string(),
  resource_url: z.string().url(),
});

/**
 * TypeScript type for basic label information
 */
export type LabelBasic = z.infer<typeof LabelBasicSchema>;
