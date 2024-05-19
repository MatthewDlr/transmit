import {Component, effect} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {UserProfile} from "../../../../shared/types/Profile.type";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";

@Component({
  selector: 'app-relations-page',
  standalone: true,
    imports: [
        DatePipe,
        NgForOf,
        NgIf
    ],
  templateUrl: './relations-page.component.html',
  styleUrl: './relations-page.component.css'
})
export class RelationsPageComponent {
  myRelations: UserProfile[] = [];
  user !: UserProfile;

  constructor(private userService: UserProfileService) {
    effect(async () => {
      let user = this.userService.userProfile();
      while (user === null) {
        await new Promise(resolve => setTimeout(resolve, 500));
        user = this.userService.userProfile();
      }
      this.user = user;
      await this.getMyRelations();
    });

  }

  async getMyRelations() {
    this.myRelations = await this.userService.getMyRelations();
  }

  getUserProfileById(id: string): UserProfile | undefined {
    return this.myRelations.find(profile => profile.id === id);
  }

  follow(id: string) {
    this.userService.follow(id).then(r => {
      const profile = this.getUserProfileById(id);
      if (profile) {
        profile.following = true;
      }
    });
  }

  unfollow(id: string) {
    this.userService.unfollow(id).then(r => {
      const profile = this.getUserProfileById(id);
      if (profile) {
        profile.following = false;
      }
    });
  }

  removeFollower(id: string) {
    this.userService.removeFollower(id).then(r => {
      const profile = this.getUserProfileById(id);
      if (profile) {
        profile.followsMe = false;
      }
    });

  }
}
