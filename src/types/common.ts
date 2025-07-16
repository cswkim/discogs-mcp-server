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
 * Schema for a filtered response
 */
export const FilteredResponseSchema = z.object({
  filters: z.object({
    applied: z.record(z.string(), z.array(z.any())).default({}),
    available: z.record(z.string(), z.record(z.string(), z.number().int())).default({}),
  }),
  filter_facets: z.array(
    z.object({
      title: z.string(),
      id: z.string(),
      values: z.array(
        z.object({
          title: z.string(),
          value: z.string(),
          count: z.number().int(),
        }),
      ),
      allows_multiple_values: z.boolean(),
    }),
  ),
});

const PaginationSchema = z.object({
  page: z.number().int().min(0).optional(),
  per_page: z.number().int().min(0).optional(),
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  urls: z
    .object({
      first: z.string().url().optional(),
      prev: z.string().url().optional(),
      next: z.string().url().optional(),
      last: z.string().url().optional(),
    })
    .optional(),
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
    pagination: PaginationSchema,
    [resultsFieldName]: z.array(itemSchema),
  });

/**
 * Schema for a paginated response with an object instead of an array
 * @param itemSchema The schema for the item in the object
 * @param resultsFieldName The name of the field containing the object
 */
export const PaginatedResponseWithObjectSchema = <T extends z.ZodType, K extends string>(
  itemSchema: T,
  resultsFieldName: K,
) =>
  z.object({
    pagination: PaginationSchema,
    [resultsFieldName]: itemSchema,
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
 * Schema for status values
 */
export const StatusSchema = z.enum(['Accepted', 'Draft', 'Deleted', 'Rejected']);

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
 * Common type for FastMCP session authentication
 */
export type FastMCPSessionAuth = Record<string, unknown> | undefined;

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
