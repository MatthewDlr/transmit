import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FoafService } from "../foaf/foaf.service";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { UserSuggestion } from "../../types/UserSuggestion.interface";
import { Interest } from "../../../../shared/types/Interest.type";

@Injectable({
  providedIn: "root",
})
export class SuggestionsService {
  users: WritableSignal<Set<UserSuggestion>> = signal(new Set());
  private readonly currentUser: UserProfile;
  private isLoaded: boolean = false;

  constructor(private foafService: FoafService, private userService: UserProfileService) {
    this.currentUser = this.userService.userProfile()!;

    // This function is run whenever the isLoading signal change value
    effect(async () => {
      const isLoading: boolean = this.foafService.isLoading();
      if (!isLoading && !this.isLoaded) {
        this.isLoaded = true;
        await this.addSuggestionByFriend(this.currentUser, 5).then((r) => r);
        this.addSuggestionByTags(this.currentUser, 5).then((r) => r);
      }
    });
  }

  public async addSuggestionByFriend(user: UserProfile, limit: number): Promise<void> {
    try {
      // DirectFriendsID
      const directFriendsId: Set<string> = new Set(this.foafService.getFriendsIDsOf(user.id));

      // List of ID of Friends of Friends that are not my friend
      const directFriendsOfFriendsNotFriend: UserProfile[] = [];

      // For each friendId in the set of my directFriendsId
      for (const directFriendId of directFriendsId) {
        // Get the friendsId of the given friendId (friend of friend)
        const directFriendsOfFriendsId: string[] = this.foafService.getFriendsIDsOf(directFriendId);
        for (const directFriendOfFriendId of directFriendsOfFriendsId) {
          if (!directFriendsId.has(directFriendOfFriendId) && directFriendOfFriendId !== user.id) {
            directFriendsOfFriendsNotFriend.push(await this.foafService.getProfileOf(directFriendOfFriendId));
          }
        }
      }

      const countOccurrencesWithMap = (list: UserProfile[]): Map<string, { profile: UserProfile; count: number }> => {
        const occurrenceMap = new Map<string, { profile: UserProfile; count: number }>();
        list.forEach((profile) => {
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
          friendsInCommon: count,
        });
      });
    } catch (error) {
      console.error(`Error fetching friends for user ${user.id}:`, error);
    }
  }

  public async addSuggestionByTags(myUser: UserProfile, limit: number) {
    // console.log(this.users());

    function getUserProfile(suggestion: UserSuggestion): UserProfile {
      // Destructure the UserProfile properties from the suggestion object
      const { friendsInCommon, ...userProfile } = suggestion;
      return userProfile;
    }

    const getUserProfilesFromSuggestions = (suggestions: Set<UserSuggestion>): Set<UserProfile> => {
      const profiles: Set<UserProfile> = new Set();
      suggestions.forEach((suggestion) => {
        const userProfile = getUserProfile(suggestion); // Assuming getUserProfile function is defined
        profiles.add(userProfile);
      });
      return profiles;
    };

    const myInterestSet: Set<Interest> = new Set(await this.userService.getMyInterests());
    const myInterestSetString: Set<string> = new Set();
    for (const userTag of myInterestSet) {
      if (userTag.followed) {
        myInterestSetString.add(userTag.name);
      }
    }

    if (myInterestSetString.size != 0) {
      const directFriendsId: Set<string> = new Set(this.foafService.getFriendsIDsOf(myUser.id));
      const directFriends: Set<UserProfile> = new Set();
      for (const directFriendId of directFriendsId) {
        directFriends.add(await this.foafService.getProfileOf(directFriendId));
      }

      const usersProfiles: Set<UserProfile> = getUserProfilesFromSuggestions(this.users());
      const doNotRecommend: Set<UserProfile> = new Set([...usersProfiles, ...directFriends, myUser]);
      const hashMapOfInterests: Map<UserProfile, number> = new Map<UserProfile, number>();

      try {
        const allUsers: UserProfile[] = await this.userService.getAllUsers();
        for (const user of allUsers) {
          if (![...doNotRecommend].some((profile: UserProfile) => profile.id === user.id)) {
            const userTagsSet: Set<Interest> = new Set<Interest>(await this.userService.getInterestsOf(user.id));
            const userTagsSetString: Set<string> = new Set<string>();
            for (const userTag of userTagsSet) {
              if (userTag.followed) {
                userTagsSetString.add(userTag.name);
              }
            }
            let commonCount = 0;
            myInterestSetString.forEach((value) => {
              if (userTagsSetString.has(value)) {
                commonCount++;
              }
            });

            let totalCount = myInterestSetString.size + userTagsSetString.size;
            hashMapOfInterests.set(user, commonCount / (totalCount - commonCount));
            console.log(commonCount / (totalCount - commonCount));
          }
        }
        const entriesArray = Array.from(hashMapOfInterests);
        entriesArray.sort((a, b) => b[1] - a[1]);
        const entriesArrayLimited = entriesArray.slice(0, limit);
        const sortedHashMapOfInterests = new Map<UserProfile, number>(entriesArrayLimited);
        sortedHashMapOfInterests.forEach((_, key) => {
          this.users().add(key);
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
