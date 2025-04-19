import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { PaginatedResponseSchema } from './common.js';

export const InventoryExportItemSchema = z.object({
  status: z.string(),
  created_ts: z.string().nullable(),
  url: urlOrEmptySchema(),
  finished_ts: z.string().nullable(),
  download_url: urlOrEmptySchema(),
  filename: z.string(),
  id: z.number(),
});

export const InventoryExportsResponseSchema = PaginatedResponseSchema(
  InventoryExportItemSchema,
  'items',
);

export type InventoryExportItem = z.infer<typeof InventoryExportItemSchema>;
export type InventoryExportsResponse = z.infer<typeof InventoryExportsResponseSchema>;
