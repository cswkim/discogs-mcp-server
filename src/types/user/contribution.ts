import { z } from 'zod';
import { ArtistSchema } from '../artist.js';
import {
  PaginatedResponseSchema,
  PaginatedResponseWithObjectSchema,
  QueryParamsSchema,
  UsernameInputSchema,
} from '../common.js';
import { LabelSchema } from '../label.js';
import { ReleaseSchema } from '../release.js';

const SubmissionSchema = z.object({
  artists: z.array(ArtistSchema).optional(),
  labels: z.array(LabelSchema).optional(),
  releases: z.array(ReleaseSchema).optional(),
});

export const ContributionsParamsSchema = UsernameInputSchema.merge(
  QueryParamsSchema([
    'label',
    'artist',
    'title',
    'catno',
    'format',
    'rating',
    'year',
    'added',
  ] as const),
);

export const ContributionsResponseSchema = PaginatedResponseSchema(ReleaseSchema, 'contributions');

export const SubmissionsResponseSchema = PaginatedResponseWithObjectSchema(
  SubmissionSchema,
  'submissions',
);

export type ContributionsParams = z.infer<typeof ContributionsParamsSchema>;
export type ContributionsResponse = z.infer<typeof ContributionsResponseSchema>;
export type SubmissionResponse = z.infer<typeof SubmissionsResponseSchema>;
