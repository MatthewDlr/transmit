import { Injectable } from "@angular/core";
import { AuthChangeEvent, AuthSession, createClient, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { environment } from "../environment/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private supabase: SupabaseClient;
  userSession: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this.userSession = data.session;
    });
    return this.userSession;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }
}
