import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { AuthService } from "../../../auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";
import { UserProfile } from "../../types/Profile.type";

@Injectable({
  providedIn: "root",
})
export class UserProfileService {
  private supabase = this.supabaseService.client;
  user: User | undefined;
  userProfile: WritableSignal<UserProfile | null> = signal(null);

  constructor(private auth: AuthService, private supabaseService: SupabaseService) {
    effect(() => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;

      this.getProfile().then((profile) => {
        this.userProfile.set(profile);
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

  public async update(updatedProfile: UserProfile): Promise<string> {
    const result = await this.supabase.from("profiles").upsert([{ ...updatedProfile, id: this.user?.id }]);
    if (result.error) {
      return result.error.message;
    }

    this.userProfile.set(updatedProfile);
    return "OK";
  }
}
