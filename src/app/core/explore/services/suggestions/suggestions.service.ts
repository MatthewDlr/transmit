import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FoafService } from "../foaf/foaf.service";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";

@Injectable({
  providedIn: "root",
})
export class SuggestionsService {
  users: WritableSignal<Set<UserProfile>> = signal(new Set());
  private readonly currentUser!: UserProfile;

  constructor(private foafService: FoafService, private userService: UserProfileService) {
    this.currentUser = this.userService.userProfile()!;

    // This function is run whenever the isLoading signal change value
    effect(() => {
      const isLoading: boolean = this.foafService.isLoading();
      if (isLoading) {
        // Not all users are fetched yet, we do nothing
        return;
      } else {
        // All users will be fully fetched now
        this.addSuggestion(this.currentUser);
      }
    });
  }

  public async addSuggestion(user: UserProfile, depth: number = 3) {
    try {
      const directFriends: Set<string> = new Set(this.foafService.getFriendsIDsOf(user.id));

      const exploreFriends = async (currentUser: UserProfile, currentDepth: number) => {
        if (currentDepth > depth) {
          return;
        }

        const userNode = this.foafService.getNodes().find((node) => node.id === currentUser.id);
        if (userNode) {
          const friends = this.foafService
            .getLinks()
            .filter((link) => link.source === userNode.id)
            .map((link) => this.foafService.getNodes().find((node) => node.id === link.target));

          for (const friend of friends) {
            if (friend) {
              const targetUserGraphNodeId = this.foafService.getUserFromID(friend.id).id;
              const userProfile = await this.foafService.getProfileOf(targetUserGraphNodeId);
              if (!directFriends.has(targetUserGraphNodeId)) {
                this.users().add(userProfile);
              }
              await exploreFriends(userProfile, currentDepth + 1);
            }
          }
        }
      };

      await exploreFriends(user, 1);

      console.log(this.users());
    } catch (error) {
      console.error(`Error fetching friends for user ${user.id}:`, error);
    }
  }



}
