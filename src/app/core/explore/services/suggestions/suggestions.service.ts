import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FoafService } from "../foaf/foaf.service";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { UserSuggestion } from "../../types/UserSuggestion.interface";

@Injectable({
  providedIn: "root",
})
export class SuggestionsService {
  users: WritableSignal<Set<UserSuggestion>> = signal(new Set());
  private readonly currentUser: UserProfile;

  constructor(private foafService: FoafService, private userService: UserProfileService) {
    this.currentUser = this.userService.userProfile()!;

    // This function is run whenever the isLoading signal change value
    effect(() => {
      const isLoading: boolean = this.foafService.isLoading();
      if (!isLoading) {
        // All users are fully fetched now
        this.addSuggestionByFriend(this.currentUser, 5);
      }
    });
  }

  public async addSuggestionByFriend(user: UserProfile, limit: number) {
    try {
      // DirectFriendsID
      const directFriendsId: Set<string> = new Set(await this.foafService.getFriendsIDsOf(user.id));

      // List of ID of Friends of Friends that are not my friend
      const directFriendsOfFriendsNotFriend: UserProfile[] = [];

      // For each friendId in the set of my directFriendsId
      for (const directFriendId of directFriendsId) {
        // Get the friendsId of the given friendId (friend of friend)
        const directFriendsOfFriendsId: string[] = await this.foafService.getFriendsIDsOf(directFriendId);
        for (const directFriendOfFriendId of directFriendsOfFriendsId) {
          if (!directFriendsId.has(directFriendOfFriendId) && directFriendOfFriendId !== user.id) {
            directFriendsOfFriendsNotFriend.push(await this.foafService.getProfileOf(directFriendOfFriendId));
          }
        }
      }

      const countOccurrencesWithMap = (list: UserProfile[]): Map<string, { profile: UserProfile, count: number }> => {
        const occurrenceMap = new Map<string, { profile: UserProfile, count: number }>();
        list.forEach(profile => {
          const key = profile.id;
          const entry = occurrenceMap.get(key);
          if (entry) {
            entry.count += 1;
          } else {
            occurrenceMap.set(key, { profile, count: 1 });
          }
        });
        return occurrenceMap;
      };

      const occurrencesMap = countOccurrencesWithMap(directFriendsOfFriendsNotFriend);
      const sortedSuggestions = Array.from(occurrencesMap.values()).sort((a, b) => b.count - a.count);

      // Limit to limit value unique suggestions
      const limitedSuggestions = sortedSuggestions.slice(0, limit);

      limitedSuggestions.forEach(({ profile, count }) => {
        this.users().add({
          ...profile,
          friendsInCommon: count
        });
      });

      console.log(Object.fromEntries(occurrencesMap.entries()));

    } catch (error) {
      console.error(`Error fetching friends for user ${user.id}:`, error);
    }
  }
}
