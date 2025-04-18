import { z } from 'zod';
import { ArtistSchema } from '../artist.js';
import { PaginatedResponseWithObjectSchema } from '../common.js';
import { LabelSchema } from '../label.js';
import { ReleaseSchema } from '../release.js';

const SubmissionSchema = z.object({
  artists: z.array(ArtistSchema).optional(),
  labels: z.array(LabelSchema).optional(),
  releases: z.array(ReleaseSchema).optional(),
});

export const SubmissionsResponseSchema = PaginatedResponseWithObjectSchema(
  SubmissionSchema,
  'submissions',
);

export type SubmissionResponse = z.infer<typeof SubmissionsResponseSchema>;
