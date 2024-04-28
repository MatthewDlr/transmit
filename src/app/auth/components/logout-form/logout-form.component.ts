import { Component, NgZone } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-logout-form",
  standalone: true,
  imports: [],
  templateUrl: "./logout-form.component.html",
  styleUrl: "./logout-form.component.css",
})
export class LogoutFormComponent {
  constructor(private auth: AuthService, private router: Router, private ngZone: NgZone) {
    this.auth.authChanges((event, session) => {
      console.info(`Authentication event: ${event}`);

      if (event == "SIGNED_OUT" || !session) {
        this.ngZone.run(() => this.router.navigate(["/login"]));
      }
    });
  }

  onSignOut() {
    this.auth.signOut();
  }
}
