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
  private userGraph: AdjacencyNodeList = new AdjacencyNodeList();
  public isLoading: WritableSignal<boolean> = signal(true);
  public readonly DEFAULT_MAX_DEPTH = 2;

  constructor(private supabaseService: SupabaseService, private userService: UserProfileService) {
    this.fetch(this.DEFAULT_MAX_DEPTH);
    //this.subscribeToDeletions();
    //this.subscribeToInserts();

    effect(() => {
      if (!this.isLoading()) {
        this.userGraph.print();
      }
    });
  }

  public async fetch(maxDepth: number) {
    this.isLoading.set(true);
    this.userGraph.clear();

    const mainUser: string = this.userService.getUserID();
    this.userGraph.addUser(mainUser, 0);
    await this.mapFriendsOf(mainUser, maxDepth);

    this.isLoading.set(false);
  }

  private async mapFriendsOf(userID: string, maxDepth: number) {
    const idsToFetch: string[] = [userID];
    const fetchedUsers: Set<string> = new Set();

    while (idsToFetch.length > 0) {
      const currentUser: GraphNode | undefined = this.userGraph.getUserFromID(idsToFetch.pop()!);
      if (!currentUser || currentUser.depth >= maxDepth || fetchedUsers.has(currentUser.id)) continue;

      const friendsID = await this.fetchFriendsIdOf(currentUser.id);
      console.log("friendsID", friendsID);
      friendsID.forEach((friendID) => {
        const friend = this.userGraph.addUser(friendID, currentUser.depth + 1);
        this.userGraph.addFriend(currentUser, friend);
        if (!fetchedUsers.has(friendID)) idsToFetch.push(friendID);
      });

      fetchedUsers.add(currentUser.id);
    }
  }

  private async fetchFriendsIdOf(userID: string): Promise<string[]> {
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
    return this.userGraph.getLinks();
  }

  public getNodes(): GraphNode[] {
    return this.userGraph.getUsers();
  }
}
