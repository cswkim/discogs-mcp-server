// import { isDiscogsError } from '../errors.js';
// import type { CurrencyCode } from '../types/common.js';
// import { type Release, type ReleaseIdInput, ReleaseSchema } from '../types/release.js';
// import { DiscogsService } from './index.js';

// /**
//  * Service for Discogs Release-related operations
//  */
// export class ReleaseService extends DiscogsService {
//   constructor() {
//     super('/releases');
//   }

//   /**
//    * The Release resource represents a particular physical or digital object released by one or more Artists
//    *
//    * @param release_id The Release ID
//    * @param options Optional currency code parameter
//    * @returns {Release} The release information
//    * @throws {DiscogsAuthenticationError} If authentication fails
//    * @throws {DiscogsResourceNotFoundError} If the release cannot be found
//    * @throws {Error} If there's a validation error or other unexpected error
//    */
//   async getRelease(
//     { release_id }: ReleaseIdInput,
//     options?: { curr_abbr?: CurrencyCode },
//   ): Promise<Release> {
//     try {
//       const response = await this.request<Release>(`/${release_id}`, {
//         params: options,
//       });

//       // Validate the response using Zod schema
//       const validatedResponse = ReleaseSchema.parse(response);
//       return validatedResponse;
//     } catch (error) {
//       // If it's already a Discogs error, just rethrow it
//       if (isDiscogsError(error)) {
//         throw error;
//       }

//       // For validation errors or other unexpected errors, wrap them
//       throw new Error(`Failed to get release: ${String(error)}`);
//     }
//   }
// }
