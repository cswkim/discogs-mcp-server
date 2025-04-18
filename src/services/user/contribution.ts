import { isDiscogsError } from '../../errors.js';
import { UsernameInput } from '../../types/common.js';
import { SubmissionResponse, SubmissionsResponseSchema } from '../../types/user/contribution.js';
import { BaseUserService } from '../index.js';

export class UserSubmissionsService extends BaseUserService {
  /**
   * Retrieve a user's submissions by username
   *
   * @param username The username of the user to get submissions for
   * @throws {DiscogsResourceNotFoundError} If the username is not found
   * @throws {DiscogsError} If there's an unexpected error
   * @returns {SubmissionResponse} The user's submissions
   */
  async get({ username }: UsernameInput): Promise<SubmissionResponse> {
    try {
      const response = await this.request<SubmissionResponse>(`/${username}/submissions`);

      const validatedResponse = SubmissionsResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get user submissions: ${String(error)}`);
    }
  }
}
