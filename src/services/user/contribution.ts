import { isDiscogsError } from '../../errors.js';
import { UsernameInput } from '../../types/common.js';
import {
  type ContributionsParams,
  type ContributionsResponse,
  ContributionsResponseSchema,
  type SubmissionResponse,
  SubmissionsResponseSchema,
} from '../../types/user/contribution.js';
import { BaseUserService } from '../index.js';

export class UserContributionsService extends BaseUserService {
  /**
   * Retrieve a user's contributions by username
   *
   * @param username The username of the user to get contributions for
   * @throws {DiscogsResourceNotFoundError} If the username is not found
   * @throws {DiscogsError} If there's an unexpected error
   * @returns {ContributionsResponse} The user's contributions
   */
  async get({ username, ...options }: ContributionsParams): Promise<ContributionsResponse> {
    try {
      const response = await this.request<ContributionsResponse>(`/${username}/contributions`, {
        params: options,
      });

      const validatedResponse = ContributionsResponseSchema.parse(response);
      return validatedResponse;
    } catch (error) {
      if (isDiscogsError(error)) {
        throw error;
      }

      throw new Error(`Failed to get user contributions: ${String(error)}`);
    }
  }
}

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
