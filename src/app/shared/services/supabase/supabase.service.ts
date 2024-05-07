import { Injectable } from "@angular/core";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    const supabaseUrl = "https://segqzlhynonojmgjmwcu.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZ3F6bGh5bm9ub2ptZ2ptd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5NDM3NTksImV4cCI6MjAyOTUxOTc1OX0.uovxi_U919KKEGEr-YdGdGsKzL7SpeVxQlzhOjdt8nM";

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  // Disable the email auth before, if not you will be instantly timed out
  private async createFakeUsers() {
    for (let i = 0; i < 100; i++) {
      console.log(`Creating fake user ${i}...`);
      const { data, error } = await this.client.auth.signUp({
        email: `fake-user-${i}@supabase.com`,
        password: this.generateRandomString(10),
      });
      if (error) {
        console.error(`Error creating fake user ${i}:`, error);
        break;
      } else {
        console.log(`Fake user ${i} created:`, data);
        await this.client.auth.signOut();
      }
    }
  }

  private generateRandomString(length: number): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
