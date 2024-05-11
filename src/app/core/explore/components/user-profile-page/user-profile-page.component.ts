import {Component, effect, OnInit} from '@angular/core';
import {UserProfile} from "../../../../shared/types/Profile.type";
import {Interest} from "../../../../shared/types/Interest.type";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {ActivatedRoute} from '@angular/router';
import {NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.css'
})
export class UserProfilePageComponent  implements OnInit{

  externUserId !: number;
  externUser!: UserProfile;
  imageError = false;

  constructor(private userService: UserProfileService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {

    this.externUserId = Number(this.route.snapshot.paramMap.get('id')) ?? 0;
    this.userService.getExternalProfile(this.externUserId)
      .then(user => {
        if (user !== null) {
          this.externUser = user;
        }
      })
      .catch(error => {
        console.error(error);
      });

  }

  onImageError(event: any) {
    event.target.src = ''; // clear the broken image URL
    this.imageError = true;
  }
}
