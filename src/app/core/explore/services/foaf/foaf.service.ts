import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../../../../shared/services/supabase/supabase.service";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { AdjacencyNodeList } from "../../types/AdjacencyList.class";
import { GraphNode } from "../../types/GraphNode.interface";
import { SimulationLinkDatum } from "d3";

@Injectable({
  providedIn: "root",
})
export class FoafService {
  private supabase: SupabaseClient = this.supabaseService.client;
  private userID: string = this.userService.getUserID();
  private networkUsers: AdjacencyNodeList = new AdjacencyNodeList();
  public isLoading: WritableSignal<boolean> = signal(true);
  public readonly DEFAULT_MAX_DEPTH = 2;

  constructor(private supabaseService: SupabaseService, private userService: UserProfileService) {
    this.fetch(this.DEFAULT_MAX_DEPTH);

    effect(() => {
      if (!this.isLoading()) {
        console.log(this.networkUsers.getNodes());
        console.log(this.networkUsers.getLinks());
      }
    });
  }

  public async fetch(maxDepth: number) {
    console.log(maxDepth);
    this.isLoading.set(true);
    await this.getFriendsOfFriends(this.userID, 0, maxDepth);
    this.isLoading.set(false);

    this.subscribeToDeletions();
    this.subscribeToInserts();
  }

  private async getFriendsOfFriends(userID: string, depth: number, maxDepth: number) {
    if (depth >= maxDepth) return;

    const friends = await this.getFriendsOf(userID, depth);
    this.networkUsers.processedUsers.add(userID);
    //this.networkUsers.print();

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

  private subscribeToDeletions() {
    const channels = this.supabase
      .channel("custom-delete-channel")
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "following" }, (payload) => {
        console.log("Change received!", payload);
      })
      .subscribe();
  }

  private subscribeToInserts() {
    const channels = this.supabase
      .channel("custom-delete-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "following" }, (payload) => {
        console.log("Change received!", payload);
      })
      .subscribe();
  }

  public getLinks(): SimulationLinkDatum<GraphNode>[] {
    return this.networkUsers.getLinks();
  }

  public getNodes(): GraphNode[] {
    return this.networkUsers.getNodes();
  }
}
