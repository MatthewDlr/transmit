import { Injectable, Signal, WritableSignal, computed, signal } from "@angular/core";
import { AuthChangeEvent, AuthOtpResponse, AuthSession, Session, User } from "@supabase/supabase-js";
import { SupabaseService } from "../../shared/services/supabase/supabase.service";
import { BehaviorSubject, Observable } from "rxjs";

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
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private supabaseService: SupabaseService) {
    this.isLoading.next(true);
    this.supabase.auth.getSession().then((response) => {
      this.userSession.set(response.data.session || null);
      console.log("userSession:", this.userSession());
      this.isLoading.next(false);
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
