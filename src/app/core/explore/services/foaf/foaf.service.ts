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
    //this.subscribeToDeletions();
    //this.subscribeToInserts();

    effect(() => {
      if (!this.isLoading()) {
        console.log(this.networkUsers.getUsers());
        console.log(this.networkUsers.getLinks());
      }
    });
  }

  public async fetch(maxDepth: number) {
    this.isLoading.set(true);
    this.networkUsers = new AdjacencyNodeList();
    await this.mapFriendsOf(this.userID, 0, maxDepth);
    this.isLoading.set(false);
  }

  private async mapFriendsOf(userID: string, depth: number, maxDepth: number) {
    if (depth >= maxDepth || this.networkUsers.processedUsers.has(userID)) return;

    const friendsIDs = await this.fetchFriendsIdOf(userID, depth);
    this.networkUsers.addFriends(userID, friendsIDs, depth);

    this.networkUsers.getUsers().forEach((user) => {
      this.mapFriendsOf(user.id, depth + 1, maxDepth);
    });
  }

  private async fetchFriendsIdOf(userID: string, depth: number): Promise<string[]> {
    let { data: followed_users_id, error } = await this.supabase.from("following").select("followed_user_id").eq("user_id", userID);

    if (error) throw Error(error.message);
    const friendsIDs: string[] = followed_users_id ? followed_users_id.map((friend) => friend.followed_user_id).flat() : [];

    return friendsIDs;
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
    return this.networkUsers.getUsers();
  }
}
