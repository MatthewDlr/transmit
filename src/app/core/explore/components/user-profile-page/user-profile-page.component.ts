import {Component, effect, OnInit} from '@angular/core';
import {UserProfile} from "../../../../shared/types/Profile.type";
import {Interest} from "../../../../shared/types/Interest.type";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {ActivatedRoute} from '@angular/router';
import {KeyValuePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, NgStyle} from "@angular/common";

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    NgForOf,
    KeyValuePipe,
    NgClass,
    NgStyle
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.css'
})
export class UserProfilePageComponent  implements OnInit{

  externUserId !: number;
  externUser!: UserProfile;
  imageError = false;
  myInterests: Map<number, Interest> = new Map();
  userInterests: Map<number, Interest> = new Map();
  defaultImageUrl = './assets/images/defpfp.png';

  constructor(private userService: UserProfileService, private route: ActivatedRoute) {

  }

  async ngOnInit(): Promise<void> {
    try {
      this.externUserId = Number(this.route.snapshot.paramMap.get('id')) ?? 0;

      const user = await this.userService.getExternalProfile(this.externUserId);
      if (user !== null) {
        this.externUser = user;

        const externUserInterests = await this.userService.getExternalUserInterests(this.externUserId);
        externUserInterests.forEach((interest: Interest) => {
          if (interest.followed) {
            this.userInterests.set(interest.id, interest);
          }
        });

        const myInterests = await this.userService.getMyInterests();
        if (myInterests !== undefined) {
          myInterests.forEach((interest: Interest) => {
            if (interest.followed) {
              this.myInterests.set(interest.id, interest);
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  onImageError(event: any) {
    console.log("error on pfp loading, defaulting");
    event.target.src = this.defaultImageUrl;
  }
}
