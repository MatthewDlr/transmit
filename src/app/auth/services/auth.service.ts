import { Injectable, Signal, WritableSignal, computed, signal } from "@angular/core";
import { AuthChangeEvent, AuthOtpResponse, AuthSession, Session, User } from "@supabase/supabase-js";
import { SupabaseService } from "../../shared/services/supabase/supabase.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private supabase = this.supabaseService.client;
  public userSession: WritableSignal<AuthSession | null> = signal(null);
  public isLoggedIn: Signal<boolean> = computed(() => {
    if (this.userSession()) return true;
    return false;
  });

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
    this.supabase.auth.signOut();
    this.userSession.set(null);
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
