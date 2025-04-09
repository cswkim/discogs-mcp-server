import { UserCollectionService } from './collection.js';
import { UserListsService } from './lists.js';
import { UserProfileService } from './profile.js';
import { UserWantsService } from './wants.js';

/**
 * Main user service that composes all specialized services
 */
export class UserService {
  public collection: UserCollectionService;
  public lists: UserListsService;
  public profile: UserProfileService;
  public wants: UserWantsService;

  constructor() {
    this.collection = new UserCollectionService();
    this.lists = new UserListsService();
    this.profile = new UserProfileService();
    this.wants = new UserWantsService();
  }
}
