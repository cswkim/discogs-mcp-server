import { z } from 'zod';
import { PaginatedResponseSchema, QueryParamsSchema, UsernameInputSchema } from '../common.js';

/**
 * Schema for a user's list item
 */
export const UserListItemSchema = z.object({
  id: z.number(),
  date_added: z.string(),
  date_changed: z.string(),
  description: z.string().optional(),
  name: z.string(),
  public: z.boolean(),
  resource_url: z.string().url(),
  uri: z.string().url(),
});

/**
 * Schema for lists query parameters
 */
export const UserListsParamsSchema = UsernameInputSchema.merge(QueryParamsSchema());

/**
 * Schema for paginated user lists response
 */
export const UserListsSchema = PaginatedResponseSchema(UserListItemSchema, 'lists');

/**
 * Type for a user's list item
 */
export type UserListItem = z.infer<typeof UserListItemSchema>;

/**
 * TypeScript type for lists query parameters
 */
export type UserListsParams = z.infer<typeof UserListsParamsSchema>;

/**
 * Type for paginated user lists response
 */
export type UserLists = z.infer<typeof UserListsSchema>;
