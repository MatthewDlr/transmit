import { Injectable, WritableSignal, signal } from "@angular/core";
import { AuthChangeEvent, AuthOtpResponse, AuthSession, createClient, Session, User } from "@supabase/supabase-js";
import { SupabaseService } from "../../shared/services/supabase/supabase.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private supabase = this.supabaseService.client;
  public userSession: WritableSignal<AuthSession | null> = signal(null);

  constructor(private supabaseService: SupabaseService) {
    this.supabase.auth.getSession().then((response) => {
      this.userSession.set(response.data.session || null);
      console.log("userSession:", this.userSession());
    });
  }

  public signIn(email: string): Promise<AuthOtpResponse> {
    return this.supabase.auth.signInWithOtp({ email });
  }

  public signOut() {
    return this.supabase.auth.signOut();
  }

  public getUser(): User {
    const user = this.userSession()?.user;
    if (!user) throw Error("User is not connected or undefined");
    return user;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
