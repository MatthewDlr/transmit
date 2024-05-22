import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { CommonModule } from "@angular/common";
import { UserSuggestion } from "../../types/UserSuggestion.interface";

@Component({
  selector: "app-suggestion-tile",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./suggestion-tile.component.html",
  styleUrl: "./suggestion-tile.component.css",
})
export class SuggestionTileComponent {
  @Input() user!: UserSuggestion;
  isFollowed: boolean = false;

  constructor(private userService: UserProfileService) {}

  async onFollowClick() {
    if (this.isFollowed) {
      const result = await this.userService.unfollow(this.user.id);
      if (result) this.isFollowed = false;

    } else {
      const result = await this.userService.follow(this.user.id);
      if (result) this.isFollowed = true;
    }

  }
}
