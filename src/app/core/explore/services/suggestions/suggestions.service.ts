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
    effect( async () => {
      const isLoading: boolean = this.foafService.isLoading();
      if (!isLoading) {
        // All users are fully fetched now
        await this.addSuggestionByFriend(this.currentUser, 5).then(r => r);
        this.addSuggestionByTags(this.currentUser, 5).then(r => r);
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

      const countOccurrencesWithMap = (list: UserProfile[]): Map<string, { profile: UserProfile, count: number }> => {
        const occurrenceMap = new Map<string, { profile: UserProfile, count: number }>();
        list.forEach(profile => {
          const key = profile.id;
          const entry = occurrenceMap.get(key);
          if (entry) {
            entry.count += 1;
          } else {
            occurrenceMap.set(key, {profile, count: 1});
          }
        });
        return occurrenceMap;
      };

      const occurrencesMap = countOccurrencesWithMap(directFriendsOfFriendsNotFriend);
      const sortedSuggestions = Array.from(occurrencesMap.values()).sort((a, b) => b.count - a.count);

      // Limit to limit value unique suggestions
      const limitedSuggestions = sortedSuggestions.slice(0, limit);

      limitedSuggestions.forEach(({profile, count}) => {
        this.users().add({
          ...profile,
          friendsInCommon: count
        });
      });
    } catch (error) {
      console.error(`Error fetching friends for user ${user.id}:`, error);
    }
  }

  public async addSuggestionByTags(myUser: UserProfile, limit: number) {

    function getUserProfile(suggestion: UserSuggestion): UserProfile {
      // Destructure the UserProfile properties from the suggestion object
      const { friendsInCommon, ...userProfile } = suggestion;
      return userProfile;
    }

    const getUserProfilesFromSuggestions = (suggestions: Set<UserSuggestion>): Set<UserProfile> => {
      const profiles: Set<UserProfile> = new Set();
      suggestions.forEach(suggestion => {
        const userProfile = getUserProfile(suggestion); // Assuming getUserProfile function is defined
        profiles.add(userProfile);
      });
      return profiles;
    };

    const myInterestString: string[] = (await this.userService.getMyInterests()).filter(interest => interest.followed).map(interest => interest.name);

    if (myInterestString.length != 0){
      const directFriends: Set<UserProfile> = new Set(await Promise.all([...new Set
      (this.foafService.getFriendsIDsOf(myUser.id))].map(id => this.foafService.getProfileOf(id))));

      const usersProfiles: Set<UserProfile> = getUserProfilesFromSuggestions(this.users());
      const doNotRecommend: Set<UserProfile> = new Set([...usersProfiles, ...directFriends, myUser]);
      const hashMapOfInterests: Map<UserProfile, number> = new Map<UserProfile, number>();

      try {
        const allUsers: UserProfile[] = await this.userService.getAllUsers();
        for (const user of allUsers) {
          if (user && user.name){
            if (![...doNotRecommend].some((profile: UserProfile) => profile.id === user.id)) {

              const userTagString: string[] = (await this.userService.getInterestsOf(user.id)).filter(interest => interest.followed).map(interest => interest.name);

              let commonCount = 0;
              myInterestString.forEach(tag => {
                if (userTagString.includes(tag)) {
                  commonCount++;
                }
              });
              let totalCount = myInterestString.length + userTagString.length;
              hashMapOfInterests.set(user, commonCount/(totalCount - commonCount));
            }
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
