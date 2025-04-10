import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';

/**
 * Schema for basic label information
 */
export const LabelBasicSchema = z.object({
  id: z.number(),
  catno: z.string(),
  entity_type: z.string().optional(),
  entity_type_name: z.string().optional(),
  name: z.string(),
  resource_url: urlOrEmptySchema(),
});

/**
 * TypeScript type for basic label information
 */
export type LabelBasic = z.infer<typeof LabelBasicSchema>;
