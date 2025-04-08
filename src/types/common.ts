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
      page: z.number().int().min(1).optional(),
      per_page: z.number().int().min(1).max(100).optional(),
      pages: z.number().int().min(1),
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
export const QueryParamsSchema = <T extends [string, ...string[]]>(validSortKeys?: T) =>
  z.object({
    // Pagination
    page: z.number().int().min(1).optional(),
    per_page: z.number().int().min(1).max(100).optional(),

    // Sorting
    sort: validSortKeys ? z.enum(validSortKeys).optional() : z.string().optional(),
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
export type QueryParams<T extends [string, ...string[]] = [string, ...string[]]> = z.infer<
  ReturnType<typeof QueryParamsSchema<T>>
>;
