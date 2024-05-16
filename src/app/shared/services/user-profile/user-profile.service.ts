import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { AuthService } from "../../../auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";
import { UserProfile } from "../../types/Profile.type";
import { Interest } from "../../types/Interest.type";
import { Post } from "../../types/Post.type";


@Injectable({
  providedIn: "root",
})
export class UserProfileService {
  private supabase = this.supabaseService.client;
  private user: User | undefined;
  userProfile: WritableSignal<UserProfile | null> = signal(null);
  interests: WritableSignal<Map<number, Interest>> = signal(new Map());

  constructor(private auth: AuthService, private supabaseService: SupabaseService) {
    effect(() => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;

      this.getProfileOf(this.user.id).then((profile) => {
        this.userProfile.set(profile);
      });

      this.getInterestsOf(this.user.id).then((interests) => {
        this.interests.set(new Map(interests.map((interest) => [interest.id, interest])));
      });
    });
  }

  public getUserID(): string {
    if (!this.user) throw Error("User is not connected");
    return this.user.id;
  }

  public async getProfileOf(userID: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("updated_at, name, last_name, avatar_url")
      .eq("id", userID)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Seems that user does not exist in database");

    const user = data as UserProfile;
    return user;
  }

  public async getInterestsOf(userID: string): Promise<Interest[]> {
    let { data: interests_list, error: error1 } = await this.supabase.from("interests_list").select("*");
    let { data: interests, error: error2 } = await this.supabase.from("interests").select("interest_id").eq("profile_id", userID);

    if (error1) throw Error(error1.message);
    if (error2) throw Error(error2.message);

    const user_interests: number[] = interests?.map((interest) => interest.interest_id) || [];

    const userInterests =
      interests_list?.map((interest) => ({
        id: interest.id,
        name: interest.name,
        followed: user_interests.includes(interest.id),
      })) || [];

    return userInterests;
  }

  public async followInterest(interest: Interest) {
    const { data, error } = await this.supabase
      .from("interests")
      .insert([{ profile_id: this.user?.id, interest_id: interest.id }])
      .select();

    if (error) throw Error(error.message);
    if (!this.interests()) return;

    this.interests.update((interests) => {
      return interests.set(interest.id, interest);
    });
  }

  public async unfollowInterest(interest: Interest) {
    const { error } = await this.supabase.from("interests").delete().eq("interest_id", interest.id);
    if (error) throw Error(error.message);

    this.interests.update((interests) => {
      return interests.set(interest.id, interest);
    });
  }

  public async update(updatedProfile: UserProfile): Promise<string> {
    const result = await this.supabase.from("profiles").upsert([{ ...updatedProfile, id: this.user?.id }]);
    if (result.error) {
      return result.error.message;
    }

    this.userProfile.set(updatedProfile);
    return "OK";
  }

  public async doesLinkExistWith(followedUserId: string): Promise<boolean> {
    if (!this.user) throw new Error("User is not logged in");

    const { data: data1, error: error1 } = await this.supabase
      .from("following")
      .select("*")
      .eq("user_id", this.user.id)
      .eq("followed_user_id", followedUserId);

    const { data: data2, error: error2 } = await this.supabase
      .from("following")
      .select("*")
      .eq("user_id", followedUserId)
      .eq("followed_user_id", this.user.id);

    if (error1 || error2) throw error1 || error2;
    return !(data1?.length === 0 && data2.length === 0);
  }

  public async follow(userID: string): Promise<boolean> {
    if (!this.user) throw new Error("User is not logged in");

    const { error } = await this.supabase.from("following").insert([{ user_id: this.user.id, followed_user_id: userID }]);

    if (error) return false;
    return true;
  }

  public async unfollow(followedUserId: string): Promise<boolean> {
    if (!this.user) throw new Error("User is not logged in");

    const { error: error } = await this.supabase
      .from("following")
      .delete()
      .eq("user_id", this.user.id)
      .eq("followed_user_id", followedUserId);

    if (error) return false;
    return true;
  }

  public async getMyFriendIDs(): Promise<string[]> {
    if (!this.user) throw new Error("User is not logged in");

    const { data: data1, error: error1 } = await this.supabase
      .from("following")
      .select("followed_user_id")
      .eq("user_id", this.user.id);

    const { data: data2, error: error2 } = await this.supabase
      .from("following")
      .select("user_id")
      .eq("followed_user_id", this.user.id);

    let friendIDs: string[];
    friendIDs = [
      ...(data1 || []).map(item => item.followed_user_id).filter(id => true),
      ...(data2 || []).map(item => item.user_id).filter(id => typeof id === 'string')
    ];
    return [...new Set(friendIDs)];
  }
}
