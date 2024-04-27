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
}
