import { z } from 'zod';
import { PaginatedResponseSchema, QueryParamsSchema, UsernameInputSchema } from '../common.js';
import { ListingSchema, SaleStatusSchema } from '../marketplace.js';

export const UserInventoryGetParamsSchema = UsernameInputSchema.extend({
  status: SaleStatusSchema.optional(),
}).merge(
  QueryParamsSchema([
    'listed',
    'price',
    'item',
    'artist',
    'label',
    'catno',
    'audio',
    'status',
    'location',
  ]),
);

export const UserInventoryResponseSchema = PaginatedResponseSchema(ListingSchema, 'listings');

export type UserInventoryGetParams = z.infer<typeof UserInventoryGetParamsSchema>;

export type UserInventoryResponse = z.infer<typeof UserInventoryResponseSchema>;
