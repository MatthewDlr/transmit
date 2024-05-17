import { Injectable, WritableSignal, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { SupabaseService } from "../../../../shared/services/supabase/supabase.service";

@Injectable({
  providedIn: "root",
})
export class UsersPaletteService {
  public isEnabled: WritableSignal<boolean> = signal(false);
  public searchResults: WritableSignal<UserProfile[]> = signal([]);
  private supabase = this.supabaseService.client;

  constructor(private supabaseService: SupabaseService) {}

  async search(query: string) {
    const { data, error } = await this.supabase.from("profiles").select().ilike("name", `%${query}%`);

    if (error) throw Error(error.message);
    console.log(data);

    this.searchResults.set(data as UserProfile[]);
  }
}
