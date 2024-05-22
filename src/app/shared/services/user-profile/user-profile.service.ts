import {effect, Injectable, signal, WritableSignal} from "@angular/core";
import {AuthService} from "../../../auth/services/auth.service";
import {User} from "@supabase/supabase-js";
import {SupabaseService} from "../supabase/supabase.service";
import {UserProfile} from "../../types/Profile.type";
import {Interest} from "../../types/Interest.type";

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

  public async isOnboarded(): Promise<boolean> {
    if (!this.user) throw Error("User is not connected");
    const {data, error} = await this.supabase
      .from("onboarding")
      .select("")
      .eq("user_id", this.user.id);

    if (error) { throw error }
    return !(data?.length === 0);
  }

  public async onboard() {
    if (!this.user) throw Error("User is not connected");
    const {error: insertError} = await this.supabase
      .from('onboarding')
      .insert([
        {user_id: this.user.id}
      ]);
    if (insertError) throw insertError;
  }

  public async setInfo(name: string, last_name: string): Promise<void> {
    if (!this.user) throw Error("User is not connected");
    const {error: insertError} = await this.supabase
      .from('profiles')
      .update([
        { name: name, last_name: last_name }
      ]).eq(
        "id", this.user.id
      );
    if (insertError) throw insertError;
  }

  public async getProfileOf(userID: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, updated_at, name, last_name, avatar_url")
      .eq("id", userID)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Seems that user does not exist in database");

    return data as UserProfile;
  }

  public async getInterestsOf(userID: string): Promise<Interest[]> {
    let { data: interests_list, error: error1 } = await this.supabase.from("interests_list").select("*");
    let { data: interests, error: error2 } = await this.supabase.from("interests").select("interest_id").eq("user_id", userID);

    if (error1) throw Error(error1.message);
    if (error2) throw Error(error2.message);

    const user_interests: number[] = interests?.map((interest) => interest.interest_id) || [];

    return interests_list?.map((interest) => ({
      id: interest.id,
      name: interest.name,
      followed: user_interests.includes(interest.id),
    })) || [];
  }

  public async getMyInterests(){
    if (!this.user) throw Error("User is not connected");
    return await this.getInterestsOf(this.user.id);
  }

  public async followInterest(interest: Interest) {
    const { data, error } = await this.supabase
      .from("interests")
      .insert([{ user_id: this.user?.id, interest_id: interest.id }])
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

  public async doIFollowUser(followedUserId: string): Promise<boolean> {
    if (!this.user) throw new Error("User is not logged in");

    const { data, error } = await this.supabase
      .from("following")
      .select("*")
      .eq("user_id", this.user.id)
      .eq("followed_user_id", followedUserId);

    if (error) throw error;
    return !(data?.length === 0);
  }

  public async follow(userID: string): Promise<boolean> {
    if (!this.user) throw new Error("User is not logged in");

    const { error } = await this.supabase.from("following").insert([{ user_id: this.user.id, followed_user_id: userID }]);
    return !error;

  }

  public async unfollow(followedUserId: string): Promise<boolean> {
    if (!this.user) throw new Error("User is not logged in");

    const { error: error } = await this.supabase
      .from("following")
      .delete()
      .eq("user_id", this.user.id)
      .eq("followed_user_id", followedUserId);

    return !error;

  }

  public async getFollowedUsers(): Promise<string[]> {
    if (!this.user) {
      throw new Error("User is not logged in");
    }

    const { data, error } = await this.supabase
      .from("following")
      .select("followed_user_id")
      .eq("user_id", this.user.id);

    if (error) {
      console.error(error);
      return [];
    }

    return Array.from(new Set(data.map((item) => item.followed_user_id)));
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
      ...(data1 || []).map((item) => item.followed_user_id).filter(() => true),
      ...(data2 || []).map((item) => item.user_id).filter(() => true),
    ];
    return [...new Set(friendIDs)];
  }

  public async deleteUser(userID: string): Promise<string> {
    const { error } = await this.supabase.from("profiles").delete().eq("id", userID);
    if (error) return error.message;
    return "OK";
  }

  async getUserAvatarUrl() {
    if (!this.user) { throw new Error('User is not logged in'); }

    const files = [`${this.user.id}.jpg`, `${this.user.id}.jpeg`, `${this.user.id}.png`];
    let filePath: string | null = null;

    const { data: fileList, error } = await this.supabase
      .storage
      .from('avatars')
      .list('');

    if (error || fileList === null) { console.error('Error querying avatar:', error); return null}

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name === files[0] || file.name === files[1] || file.name === files[2]) {
        filePath = file.name;
        break;
      }
    }

    if (filePath !== null) {
      return this.supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath)
        .data.publicUrl;
    }
    return null;
  }

  public async getMyRelations(): Promise<UserProfile[]> {
    if (!this.user) { throw new Error("User is not logged in"); }

    const { data: data1, error: error1 } = await this.supabase
      .from("following")
      .select("followed_user_id")
      .eq("user_id", this.user.id);

    const { data: data2, error: error2 } = await this.supabase
      .from("following")
      .select("user_id")
      .eq("followed_user_id", this.user.id);

    if (error1 || error2) {
      console.error("Error fetching following data:", error1, error2);
      return [];
    }

    let friendIDs: string[] = [
      ...(data1 || []).map((item) => item.followed_user_id).filter(() => true),
      ...(data2 || []).map((item) => item.user_id).filter(() => true),
    ];
    friendIDs = friendIDs.filter((id: string) => id !== this.user?.id);
    friendIDs = [...new Set(friendIDs)];

    if (friendIDs.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("profiles")
      .select()
      .in("id", friendIDs);

    if (error) {
      console.error("Error fetching profile data:", error);
      return [];
    }

    data.forEach((profile) => {
      profile.following = data1.some((item) => item.followed_user_id === profile.id);
      profile.followsMe = data2.some((item) => item.user_id === profile.id);
    });

    return data;
  }

  async removeFollower(id: string) {
    if (!this.user) throw new Error("User is not logged in");

    const { data, error} = await this.supabase
      .from("following")
      .delete()
      .eq("user_id", id)
      .eq("followed_user_id", this.user.id);

    console.log(data);

    return !error;
  }


  async deleteAvatars(id: string) {
    const {data, error} = await this.supabase
      .storage
      .from('avatars')
      .remove([id + ".png", id + ".jpg", id + ".jpeg"]);
    if(error) throw error;
  }

  public async getAllUsers(): Promise<UserProfile[]> {
    if (!this.user) throw new Error("User is not logged in");
    const { data, error } = await this.supabase
      .from("profiles")
      .select('*')
    return data as UserProfile[];
  }

}
