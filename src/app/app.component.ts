import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from "./auth/services/auth.service";
import { SupabaseService } from "./shared/services/supabase/supabase.service";
import { HeaderComponent } from "./shared/components/header/header.component";
import { UserProfileService } from "./shared/services/user-profile/user-profile.service";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { UsersPaletteService } from "./core/feed/services/users-palette/users-palette.service";
import { UsersPaletteComponent } from "./core/feed/components/users-palette/users-palette.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, UsersPaletteComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "transmit";

  constructor(
    private auth: AuthService,
    private supabase: SupabaseService,
    public router: Router,
    private user: UserProfileService,
    public usersPaletteService: UsersPaletteService,
  ) {
    injectSpeedInsights();
  }
}
