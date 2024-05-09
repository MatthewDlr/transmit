import { Injectable } from "@angular/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../../../../shared/services/supabase/supabase.service";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { Friend } from "../types/Friend.type";
import { AdjacencyFriendsList } from "../types/AdjacencyList.class";

@Injectable({
  providedIn: "root",
})
export class FoafService {
  supabase: SupabaseClient = this.supabaseService.client;
  userID: string = this.userService.getUserID();
  networkUsers: AdjacencyFriendsList = new AdjacencyFriendsList();

  constructor(private supabaseService: SupabaseService, private userService: UserProfileService) {
    this.getFriendsOf(this.userID).then((friends) => {
      friends.forEach((friend) => {
        this.getFriendsOf(friend.id);
      });
    });
  }

  public async getFriendsOf(userID: string): Promise<Friend[]> {
    if (this.networkUsers.hasUser(userID)) {
      console.info("Friends of", userID, "were already in the map!");
      return this.networkUsers.getFriendsOf(userID);
    }

    let { data: friendsProfile, error } = await this.supabase
      .from("following")
      .select("profiles:followed_user_id (name, last_name, id)")
      .eq("user_id", userID);

    if (error) throw Error(error.message);
    const friends: Friend[] = friendsProfile ? friendsProfile.map((friend) => friend.profiles).flat() : [];

    this.networkUsers.addFriends(userID, friends);
    console.log(this.networkUsers.getUsers());
    return friends;
  }
}
