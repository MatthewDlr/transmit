import {Component, effect, OnInit} from '@angular/core';
import {UserProfile} from "../../../../shared/types/Profile.type";
import {Interest} from "../../../../shared/types/Interest.type";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {ActivatedRoute} from '@angular/router';
import {AsyncPipe, KeyValuePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, NgStyle} from "@angular/common";

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    NgForOf,
    KeyValuePipe,
    NgClass,
    NgStyle,
    AsyncPipe
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
  isConnectedToUser: boolean = false;

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

        this.isConnectedToUser = await this.doesLinkExistWith(this.externUserId);
        if(this.isConnectedToUser){
          console.log("Is connected to user");
        } else {
          console.log("Not connected to user");
        }

        if (this.isConnectedToUser) {
          const removeFriendButton = document.getElementById('unfollowbtn');
          removeFriendButton?.classList.remove('hidden');
        } else {
          const addFriendButton = document.getElementById('followbtn');
          addFriendButton?.classList.remove('hidden');
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

  async follow(externUserId: number) {
    await this.userService.follow(externUserId);
    const removeFriendButton = document.getElementById('unfollowbtn');
    removeFriendButton?.classList.remove('hidden');
    const addFriendButton = document.getElementById('followbtn');
    addFriendButton?.classList.add('hidden');
  }

  async unfollow(externUserId: number) {
    await this.userService.unfollow(externUserId);
    const removeFriendButton = document.getElementById('unfollowbtn');
    removeFriendButton?.classList.add('hidden');
    const addFriendButton = document.getElementById('followbtn');
    addFriendButton?.classList.remove('hidden');
  }

  async doesLinkExistWith(externUserId: number) {
    return this.userService.doesLinkExistWith((externUserId));
  }
}
