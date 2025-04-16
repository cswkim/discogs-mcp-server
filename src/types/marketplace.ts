import { z } from 'zod';
import { urlOrEmptySchema } from '../utils.js';
import { CurrencyCodeSchema, ImageSchema } from './common.js';

const ConditionSchema = z.enum([
  'Mint (M)',
  'Near Mint (NM or M-)',
  'Very Good Plus (VG+)',
  'Very Good (VG)',
  'Good Plus (G+)',
  'Good (G)',
  'Fair (F)',
  'Poor (P)',
]);

const SleeveConditionSchema = z.enum([
  ...ConditionSchema.options,
  'Generic',
  'Not Graded',
  'No Cover',
]);

const OrderStatusSchema = z.enum([
  'New Order',
  'Buyer Contacted',
  'Invoice Sent',
  'Payment Pending',
  'Payment Received',
  'Shipped',
  'Refund Sent',
  'Cancelled (Non-Paying Buyer)',
  'Cancelled (Item Unavailable)',
  `Cancelled (Per Buyer's Request)`,
]);

const ListingReleaseSchema = z.object({
  catalog_number: z.string().optional(),
  resource_url: urlOrEmptySchema(),
  year: z.number(),
  id: z.number().int(),
  description: z.string(),
  images: z.array(ImageSchema).optional(),
  artist: z.string(),
  title: z.string(),
  format: z.string(),
  thumbnail: urlOrEmptySchema(),
  stats: z.object({
    community: z.object({
      in_wantlist: z.number().int(),
      in_collection: z.number().int(),
    }),
    user: z
      .object({
        in_wantlist: z.number().int(),
        in_collection: z.number().int(),
      })
      .optional(),
  }),
});

export const PriceSchema = z.object({
  currency: CurrencyCodeSchema,
  value: z.number(),
});

export const OriginalPriceSchema = z.object({
  curr_abbr: CurrencyCodeSchema,
  curr_id: z.number(),
  formatted: z.string(),
  value: z.number(),
});

export const SaleStatusSchema = z.enum(['For Sale', 'Expired', 'Draft']);

/**
 * The listing schema
 */
export const ListingSchema = z.object({
  id: z.number(),
  resource_url: z.string().url(),
  uri: z.string().url(),
  status: SaleStatusSchema,
  condition: z.string(),
  sleeve_condition: z.string(),
  comments: z.string().optional(),
  ships_from: z.string(),
  posted: z.string(),
  allow_offers: z.boolean(),
  offer_submitted: z.boolean().optional(),
  audio: z.boolean(),
  price: PriceSchema,
  original_price: OriginalPriceSchema,
  shipping_price: PriceSchema.optional(),
  original_shipping_price: OriginalPriceSchema.optional(),
  seller: z.object({
    id: z.number(),
    username: z.string(),
    resource_url: urlOrEmptySchema().optional(),
    avatar_url: urlOrEmptySchema(),
    stats: z.object({
      rating: z.string(),
      stars: z.number(),
      total: z.number(),
    }),
    min_order_total: z.number(),
    html_url: urlOrEmptySchema(),
    uid: z.number(),
    url: urlOrEmptySchema(),
    payment: z.string(),
    shipping: z.string(),
  }),
  release: ListingReleaseSchema,
});

/**
 * The listing ID parameter schema
 */
export const ListingIdParamSchema = z.object({
  listing_id: z.number().int(),
});

/**
 * The listing get parameters schema
 */
export const ListingGetParamsSchema = ListingIdParamSchema.extend({
  curr_abbr: CurrencyCodeSchema.optional(),
});

export const ListingNewParamsSchema = z.object({
  release_id: z.number().int(),
  condition: ConditionSchema,
  sleeve_condition: SleeveConditionSchema.optional(),
  price: z.number(),
  comments: z.string().optional(),
  allow_offers: z.boolean().optional(),
  status: SaleStatusSchema,
  external_id: z.string().optional(),
  location: z.string().optional(),
  weight: z.number().optional(),
  format_quantity: z.number().optional(),
});

export const ListingNewResponseSchema = z.object({
  listing_id: z.number().int(),
  resource_url: z.string().url(),
});

export const ListingUpdateParamsSchema = ListingIdParamSchema.merge(ListingNewParamsSchema);

export const OrderIdParamSchema = z.object({
  order_id: z.number(),
});

export const OrderEditParamsSchema = OrderIdParamSchema.extend({
  status: OrderStatusSchema.optional(),
  shipping: z.number().optional(),
});

export const OrderResponseSchema = z.object({
  id: z.number(),
  resource_url: urlOrEmptySchema(),
  messages_url: urlOrEmptySchema(),
  uri: urlOrEmptySchema(),
  status: OrderStatusSchema,
  next_status: z.array(OrderStatusSchema),
  fee: PriceSchema,
  created: z.string(),
  items: z.array(
    z.object({
      release: z.object({
        id: z.number(),
        description: z.string().optional(),
      }),
      price: PriceSchema,
      media_condition: ConditionSchema,
      sleeve_condition: SleeveConditionSchema.optional(),
      id: z.number(),
    }),
  ),
  shipping: z.object({
    currency: CurrencyCodeSchema,
    method: z.string(),
    value: z.number(),
  }),
  shipping_address: z.string(),
  address_instructions: z.string().optional(),
  archived: z.boolean().optional(),
  seller: z.object({
    id: z.number(),
    username: z.string(),
    resource_url: urlOrEmptySchema().optional(),
  }),
  last_activity: z.string().optional(),
  buyer: z.object({
    id: z.number(),
    username: z.string(),
    resource_url: urlOrEmptySchema().optional(),
  }),
  total: PriceSchema,
});

/**
 * The listing ID parameter type
 */
export type ListingIdParam = z.infer<typeof ListingIdParamSchema>;

/**
 * The listing get parameters type
 */
export type ListingGetParams = z.infer<typeof ListingGetParamsSchema>;

/**
 * The listing new parameters type
 */
export type ListingNewParams = z.infer<typeof ListingNewParamsSchema>;

/**
 * The listing new response type
 */
export type ListingNewResponse = z.infer<typeof ListingNewResponseSchema>;

/**
 * The listing update parameters type
 */
export type ListingUpdateParams = z.infer<typeof ListingUpdateParamsSchema>;

/**
 * The listing schema
 */
export type Listing = z.infer<typeof ListingSchema>;

/**
 * The order ID parameter type
 */
export type OrderIdParam = z.infer<typeof OrderIdParamSchema>;

/**
 * The order edit parameters type
 */
export type OrderEditParams = z.infer<typeof OrderEditParamsSchema>;

/**
 * The order response type
 */
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
