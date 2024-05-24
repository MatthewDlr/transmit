import { Injectable, WritableSignal, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { Interest } from "../../../../shared/types/Interest.type";

@Injectable({
  providedIn: "root",
})
export class SidePeekService {
  public currentUser: WritableSignal<UserProfile | null> = signal(null);
  public userInterests: WritableSignal<Interest[] | null> = signal(null);
  public distanceFromYou: WritableSignal<number | null> = signal(null);
  public numberOfFollowers: WritableSignal<number | null> = signal(null);

  constructor(private userService: UserProfileService) {}

  async setUser(userID: string, depth: number, followers: number) {
    const user: UserProfile = await this.userService.getProfileOf(userID);
    const interests: Interest[] = await this.userService.getInterestsOf(userID);
    this.currentUser.set(user);
    this.userInterests.set(interests);
    this.distanceFromYou.set(depth);
    this.numberOfFollowers.set(followers);
  }

  clearUser() {
    this.currentUser.set(null);
    this.userInterests.set(null);
    this.distanceFromYou.set(null);
    this.numberOfFollowers.set(null);
  }
}
