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
 * Schema for a paginated response
 * @param itemSchema The schema for the items in the array
 * @param resultsFieldName The name of the field containing the array of items
 */
export const PaginatedResponseSchema = <T extends z.ZodType, K extends string>(
  itemSchema: T,
  resultsFieldName: K,
) =>
  z.object({
    pagination: z.object({
      page: z.number().int().min(0).optional(),
      per_page: z.number().int().min(0).optional(),
      pages: z.number().int().min(0),
      items: z.number().int().min(0),
      urls: z.object({
        first: z.string().url().optional(),
        prev: z.string().url().optional(),
        next: z.string().url().optional(),
        last: z.string().url().optional(),
      }),
    }),
    [resultsFieldName]: z.array(itemSchema),
  });

/**
 * Schema for query parameters that include both pagination and sorting
 * @param validSortKeys An array of valid sort keys for the specific endpoint
 */
export const QueryParamsSchema = <T extends readonly [string, ...string[]]>(
  validSortKeys: T = [] as unknown as T,
) =>
  z.object({
    // Pagination
    page: z.number().int().min(0).optional(),
    per_page: z.number().int().min(0).max(100).optional(),

    // Sorting
    sort: z.enum(validSortKeys).optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
  });

/**
 * TypeScript type for currency codes
 */
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

/**
 * TypeScript type for a paginated response
 */
export type PaginatedResponse<T, K extends string> = z.infer<
  ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>, K>>
>;

/**
 * TypeScript type for query parameters
 */
export type QueryParams<T extends readonly [string, ...string[]]> = z.infer<
  ReturnType<typeof QueryParamsSchema<T>>
>;
