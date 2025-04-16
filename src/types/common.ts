import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';

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

export const ImageSchema = z.object({
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  resource_url: urlOrEmptySchema(),
  type: z.string().optional(),
  uri: urlOrEmptySchema(),
  uri150: urlOrEmptySchema().optional(),
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
    page: z.number().int().min(1).optional(),
    per_page: z.number().int().min(1).max(100).optional(),

    // Sorting
    sort: z.enum(validSortKeys).optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
  });

/**
 * Schema for a username input
 */
export const UsernameInputSchema = z.object({
  username: z.string().min(1, 'username is required'),
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

/**
 * TypeScript type for a username input
 */
export type UsernameInput = z.infer<typeof UsernameInputSchema>;
