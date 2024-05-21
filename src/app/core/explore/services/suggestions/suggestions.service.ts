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

  public async addSuggestion(user: UserProfile) {
    try {
      // DirectFriendsID
      const directFriendsId: Set<string> = new Set(this.foafService.getFriendsIDsOf(user.id));
      // List of ID of Friends of Friends that are not my friend
      const directFriendsOfFriendsNotFriendId: string[] = [];
      // For each friendId in the set of my directFriendsId
      for (const directFriendId of directFriendsId){
        // Get the friendsId of the given friendId (friend of friend)
        console.log('---');
        const directFriendsOfFriendsId: string[] = this.foafService.getFriendsIDsOf(directFriendId);
        console.log('directFriendsOfFriendsId' + directFriendsOfFriendsId);
        for (const directFriendOfFriendId of directFriendsOfFriendsId){
          console.log(directFriendOfFriendId);
          if (!directFriendsId.has(directFriendOfFriendId)) {
            directFriendsOfFriendsNotFriendId.push(directFriendOfFriendId);
            let user :UserProfile = await this.foafService.getProfileOf(directFriendOfFriendId);
            this.users().add(user);
          }
        }
      }

      console.log("directFriendsOfFriendsNotFriendId", directFriendsOfFriendsNotFriendId);

    } catch (error) {
      console.error(`Error fetching friends for user ${user.id}:`, error);
    }
  }


}
