import { Injectable, WritableSignal, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import {FoafService} from "../foaf/foaf.service";

@Injectable({
  providedIn: "root",
})
export class SuggestionsService {
  users: WritableSignal<Set<UserProfile>> = signal(new Set());

  constructor(private foafService: FoafService) { }

  public async addSuggestion(user: UserProfile) {
    try {
      // Fetch friends of the given user
      await this.foafService.fetch(this.foafService.DEFAULT_MAX_DEPTH);
      const userNode = this.foafService.getNodes().find(node => node.id === user.id);

      if (userNode) {
        const friends = this.foafService.getLinks()
          .filter(link => link.source === userNode.id)
          .map(link => this.foafService.getNodes().find(node => node.id === link.target));

        friends.forEach(friend => {
          if (friend) {
            const friendProfile: UserProfile = {
              last_name: "", updated_at: "",
              id: friend.id,
              name: ""
            };
            this.users().add(friendProfile);
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching friends for user ${user.id}:`, error);
    }
  }
}
