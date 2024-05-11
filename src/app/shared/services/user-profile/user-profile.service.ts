import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { AuthService } from "../../../auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";
import { UserProfile } from "../../types/Profile.type";
import { Interest } from "../../types/Interest.type";


@Injectable({
  providedIn: "root",
})
export class UserProfileService {
  private supabase = this.supabaseService.client;
  user: User | undefined;
  userProfile: WritableSignal<UserProfile | null> = signal(null);
  interests: WritableSignal<Map<number, Interest>> = signal(new Map());

  constructor(private auth: AuthService, private supabaseService: SupabaseService) {
    effect(() => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;

      this.getProfile().then((profile) => {
        this.userProfile.set(profile);
      });

      this.getInterests().then((interests) => {
        this.interests.set(new Map(interests.map((interest) => [interest.id, interest])));
      });
    });
  }

  public async getProfile(): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("updated_at, name, last_name, avatar_url")
      .eq("id", this.user?.id)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Seems to user does not exist in database");

    const user = data as UserProfile;
    console.log("user:", user);
    return user;
  }

  private async getInterests(): Promise<Interest[]> {
    let { data: interests_list, error: error1 } = await this.supabase.from("interests_list").select("*");
    let { data: interests, error: error2 } = await this.supabase
      .from("interests")
      .select("interest_id")
      .eq("profile_id", this.user?.id);

    if (error1) throw Error(error1.message);
    if (error2) throw Error(error2.message);

    const user_interests: number[] = interests?.map((interest) => interest.interest_id) || [];

    const userInterests =
      interests_list?.map((interest) => ({
        id: interest.id,
        name: interest.name,
        followed: user_interests.includes(interest.id),
      })) || [];

    console.log(userInterests);
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

  public async getExternalProfile(userId : number){
    const { data, error } = await this.supabase
      .from("profiles")
      .select("updated_at, name, last_name, avatar_url")
      .eq("user_number", userId)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Seems to user does not exist in database");

    const user = data as UserProfile;
    console.log("Queried user:", user);
    return user;
  }

  public async getExternalUserInterests(userId : number): Promise< Interest[]> {
    let { data: interests_list, error: error1 } = await this.supabase.from("interests_list").select("*");
     let { data: interests, error: error2 } = await this.supabase
      .from('user_interests_with_user_number')
      .select('interest_id')
      .eq('user_number', userId);

    if (error1) throw Error(error1.message);
    if (error2) throw Error(error2.message);

    console.log(interests);
    const user_interests: number[] = interests?.map((interest) => interest.interest_id) || [];

    const userInterests =
      interests_list?.map((interest) => ({
        id: interest.id,
        name: interest.name,
        followed: user_interests.includes(interest.id),
      })) || [];

    return userInterests;
  }

  public async getMyInterests(){
    const { data, error } = await this.supabase
      .from("profiles")
      .select("user_number")
      .eq("id", this.user?.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return;
    }

    return this.getExternalUserInterests(data.user_number);
  }
}
