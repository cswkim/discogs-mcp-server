import { z } from 'zod';

/**
 * Schema for currency codes supported by Discogs
 */
export const CurrencyCodeSchema = z.enum([
  'USD', // US Dollar
  'GBP', // British Pound
  'EUR', // Euro
  'CAD', // Canadian Dollar
  'AUD', // Australian Dollar
  'JPY', // Japanese Yen
  'CHF', // Swiss Franc
  'MXN', // Mexican Peso
  'BRL', // Brazilian Real
  'NZD', // New Zealand Dollar
  'SEK', // Swedish Krona
  'ZAR', // South African Rand
]);

/**
 * Schema for pagination parameters
 */
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).optional(),
  per_page: z.number().int().min(1).max(100).optional(),
});

/**
 * Schema for pagination metadata
 */
const PaginationMetadataSchema = z.object({
  ...PaginationParamsSchema.shape,
  pages: z.number().int().min(1),
  items: z.number().int().min(0),
  urls: z.object({
    first: z.string().url().optional(),
    prev: z.string().url().optional(),
    next: z.string().url().optional(),
    last: z.string().url().optional(),
  }),
});

/**
 * Schema for a paginated response
 * @param itemSchema The schema for the items in the array
 * @param resultsFieldName The name of the field containing the array of items
 */
export const PaginatedResponseSchema = <T extends z.ZodType, K extends string>(
  itemSchema: T,
  resultsFieldName: K,
) =>
  z.object({
    pagination: PaginationMetadataSchema,
    [resultsFieldName]: z.array(itemSchema),
  });

/**
 * TypeScript type for currency codes
 */
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

/**
 * TypeScript type for pagination parameters
 */
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * TypeScript type for pagination metadata
 */
type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>;

/**
 * TypeScript type for a paginated response
 */
export type PaginatedResponse<T, K extends string> = {
  pagination: PaginationMetadata;
} & Record<K, T[]>;
