import { z } from 'zod';

/**
 * Schema for a list item
 */
export const ListItemSchema = z.object({
  id: z.number(),
  comment: z.string().optional(),
  display_title: z.string(),
  image_url: z.string().url(),
  resource_url: z.string().url(),
  stats: z.object({
    community: z.object({
      in_collection: z.number(),
      in_wantlist: z.number(),
    }),
    user: z.object({
      in_collection: z.number(),
      in_wantlist: z.number(),
    }),
  }),
  type: z.string(),
  uri: z.string().url(),
});

/**
 * Schema for a Discogs list
 */
export const ListSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    avatar_url: z.string().url(),
    username: z.string(),
    resource_url: z.string().url(),
  }),
  name: z.string(),
  description: z.string().optional(),
  public: z.boolean(),
  date_added: z.string(),
  date_changed: z.string(),
  uri: z.string().url(),
  resource_url: z.string().url(),
  image_url: z.string().url().optional(),
  items: z.array(ListItemSchema),
});

/**
 * Schema for list ID parameters
 */
export const ListIdParamSchema = z.object({
  list_id: z.number(),
});

/**
 * TypeScript type for a list item
 */
export type ListItem = z.infer<typeof ListItemSchema>;

/**
 * TypeScript type for a Discogs list
 */
export type List = z.infer<typeof ListSchema>;

/**
 * TypeScript type for list ID parameters
 */
export type ListIdParam = z.infer<typeof ListIdParamSchema>;
