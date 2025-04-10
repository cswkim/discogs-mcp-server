import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { PaginatedResponseSchema, QueryParamsSchema } from './common.js';

/**
 * Schema for search parameters
 */
export const SearchParamsSchema = z
  .object({
    q: z.string().optional(),
    type: z.enum(['artist', 'label', 'master', 'release']).optional(),
    title: z.string().optional(),
    release_title: z.string().optional(),
    credit: z.string().optional(),
    artist: z.string().optional(),
    anv: z.string().optional(),
    label: z.string().optional(),
    genre: z.string().optional(),
    style: z.string().optional(),
    country: z.string().optional(),
    year: z.string().optional(),
    format: z.string().optional(),
    catno: z.string().optional(),
    barcode: z.string().optional(),
    track: z.string().optional(),
    submitter: z.string().optional(),
    contributor: z.string().optional(),
  })
  .merge(QueryParamsSchema(['title', 'artist', 'year']));

/**
 * Schema for search result items
 */
const SearchResultSchema = z.object({
  id: z.number(),
  barcode: z.array(z.string()).optional(),
  catno: z.string().optional(),
  community: z
    .object({
      have: z.number(),
      want: z.number(),
    })
    .optional(),
  country: z.string().optional(),
  cover_image: urlOrEmptySchema().optional(),
  format: z.array(z.string()).optional(),
  format_quantity: z.number().optional(),
  formats: z
    .array(
      z.object({
        descriptions: z.array(z.string()).optional(),
        name: z.string(),
        qty: z.string(),
        text: z.string().optional(),
      }),
    )
    .optional(),
  genre: z.array(z.string()).optional(),
  label: z.array(z.string()).optional(),
  master_id: z.number().nullable().optional(),
  master_url: urlOrEmptySchema().nullable().optional(),
  resource_url: urlOrEmptySchema(),
  style: z.array(z.string()).optional(),
  thumb: urlOrEmptySchema().optional(),
  title: z.string(),
  type: z.enum(['artist', 'label', 'master', 'release']),
  uri: z.string(),
  user_data: z
    .object({
      in_collection: z.boolean(),
      in_wantlist: z.boolean(),
    })
    .optional(),
  year: z.string().optional(),
});

/**
 * Schema for search results
 */
export const SearchResultsSchema = PaginatedResponseSchema(SearchResultSchema, 'results');

/**
 * TypeScript type for search parameters
 */
export type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * TypeScript type for search results
 */
export type SearchResults = z.infer<typeof SearchResultsSchema>;
