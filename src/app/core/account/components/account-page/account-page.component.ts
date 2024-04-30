import { Component, effect } from "@angular/core";
import { LogoutFormComponent } from "../../../../auth/components/logout-form/logout-form.component";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-account-page",
  standalone: true,
  imports: [LogoutFormComponent, FormsModule],
  templateUrl: "./account-page.component.html",
  styleUrl: "./account-page.component.css",
})
export class AccountPageComponent {
  user!: UserProfile;
  updateStatus: string = "OK";

  constructor(private userService: UserProfileService) {
    effect(() => {
      const user = this.userService.userProfile();
      if (user !== null) this.user = user;
    });
  }

  async saveUserProfile() {
    this.updateStatus = "Loading";
    this.updateStatus = await this.userService.update(this.user);
  }
}
