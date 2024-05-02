import { Component, effect } from "@angular/core";
import { LogoutFormComponent } from "../../../../auth/components/logout-form/logout-form.component";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FormsModule } from "@angular/forms";
import { Interest } from "../../../../shared/types/Interest.type";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-account-page",
  standalone: true,
  imports: [LogoutFormComponent, FormsModule, CommonModule],
  templateUrl: "./account-page.component.html",
  styleUrl: "./account-page.component.css",
})
export class AccountPageComponent {
  user!: UserProfile;
  interests: Map<number, Interest> = new Map();
  updateStatus: string = "OK";

  constructor(private userService: UserProfileService) {
    effect(() => {
      const user = this.userService.userProfile();
      if (user !== null) this.user = user;
    });

    effect(() => {
      this.interests = this.userService.interests();
    });
  }

  public async saveUserProfile() {
    this.updateStatus = "Loading";
    this.updateStatus = await this.userService.update(this.user);
  }

  public async toggleInterest(interest: Interest) {
    interest.followed = !interest.followed;
    if (interest.followed) {
      this.userService.followInterest(interest);
    } else {
      this.userService.unfollowInterest(interest);
    }
  }
}
