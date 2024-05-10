import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../../../../shared/services/supabase/supabase.service";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { GraphNode } from "../types/GraphNode.type";
import { AdjacencyNodeList } from "../types/AdjacencyList.class";

@Injectable({
  providedIn: "root",
})
export class FoafService {
  supabase: SupabaseClient = this.supabaseService.client;
  userID: string = this.userService.getUserID();
  networkUsers: AdjacencyNodeList = new AdjacencyNodeList();
  isLoading: WritableSignal<boolean> = signal(true);

  constructor(private supabaseService: SupabaseService, private userService: UserProfileService) {
    this.isLoading.set(true);
    this.getFriendsOfFriends(this.userID, 0, 2).then(() => {
      this.isLoading.set(false);
    });

    effect(() => {
      const isLoading = this.isLoading();
      console.log(isLoading);
      if (!isLoading) {
        console.log(this.networkUsers.getNodes());
        console.log(this.networkUsers.getLinks());
      }
    });
  }

  private async getFriendsOfFriends(userID: string, depth: number, maxDepth: number) {
    if (depth >= maxDepth) {
      return;
    }

    const friends = await this.getFriendsOf(userID, depth);
    this.networkUsers.processedUsers.add(userID);
    this.networkUsers.print();

    const promises = friends.map((friend) => {
      if (this.networkUsers.processedUsers.has(friend)) return Promise.resolve();
      return this.getFriendsOfFriends(friend, depth + 1, maxDepth);
    });

    await Promise.all(promises);
  }

  private async getFriendsOf(userID: string, depth: number): Promise<string[]> {
    let { data: followed_users_id, error } = await this.supabase.from("following").select("followed_user_id").eq("user_id", userID);

    if (error) throw Error(error.message);
    const friendsID: string[] = followed_users_id ? followed_users_id.map((friend) => friend.followed_user_id).flat() : [];

    this.networkUsers.addLinks(userID, friendsID, depth);
    return friendsID;
  }
}
