import { Injectable, WritableSignal, effect } from "@angular/core";
import { AuthService } from "../../../auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";
import { UserProfile } from "../../types/Profile.type";

@Injectable({
  providedIn: "root",
})
export class UserProfileService {
  private supabase = this.supabaseService.client;
  user!: User;
  userProfile!: WritableSignal<UserProfile>;

  constructor(private auth: AuthService, private supabaseService: SupabaseService) {
    effect(() => {
      this.user = this.auth.getUser();
    });
    this.getProfile().then((profile) => {
      this.userProfile.set(profile);
    });
  }

  public async getProfile(): Promise<UserProfile> {
    const { data, error } = await this.supabase.from("profiles").select("id, username, avatar_url").eq("id", this.user.id).single();
    if (error) throw error;
    if (!data) throw new Error("No data returned");

    return data as UserProfile;
  }

  public async update(updatedProfile: UserProfile): Promise<void> {
    const result = await this.supabase.from("profiles").upsert([{ ...updatedProfile, id: this.user.id }]);
    if (result.error) {
      throw new Error(result.error.message);
    }

    this.userProfile.set(updatedProfile);
  }
}
