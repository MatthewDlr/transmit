import {Component, effect, OnInit} from "@angular/core";
import { LogoutFormComponent } from "../../../../auth/components/logout-form/logout-form.component";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FormsModule } from "@angular/forms";
import { Interest } from "../../../../shared/types/Interest.type";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {PostPublishingService} from "../../../../shared/services/post-publishing/post-publishing.service";

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
  selectedFile: File | null = null;
  showMyPostsInFeed : boolean = true;

  constructor(private userService: UserProfileService, private router: Router, private postService: PostPublishingService) {
    effect(async () => {
      const user = this.userService.userProfile();
      if (user !== null) this.user = user;
      this.showMyPostsInFeed = await this.userService.doIFollowUser(this.user.id);
    });

    effect( () => {
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
      await this.userService.followInterest(interest);
    } else {
      await this.userService.unfollowInterest(interest);
    }
  }

  public async deleteAccount() {
    const confirm = window.confirm("By clicking on 'OK', your account and all your data will be deleted immediately.");
    if (!confirm) return;

    const result = await this.userService.deleteUser(this.user.id);
    if (result === "OK") this.router.navigate(["/login"]);

  }

  async selectFile(event: any) {
    this.selectedFile = event.target.files[0];
    if(this.selectedFile !== null){
      console.log("file selected : " + this.selectedFile.name)
      if (await this.postService.uploadAvatar(this.selectedFile)){
        await this.setAvatarToLatestUploadedImage();
      }
    }
  }

  async setAvatarToLatestUploadedImage(){
    const url = await this.userService.getUserAvatarUrl();
    if(url !== null){
      console.log("URL found : " + url);
      this.user.avatar_url = url;
    } else {
      console.log("No avatar_url retrieved");
      this.user.avatar_url = "Please check URL or re-upload picture.";
    }
  }

  navigateToMyPostsPage() {
    this.router.navigate(["/myPosts"]).then(r => "")
  }

  async toggleSeePosts() {
    this.showMyPostsInFeed = !this.showMyPostsInFeed;
    if (this.showMyPostsInFeed) {
      await this.userService.follow(this.user.id);
    } else {
      await this.userService.unfollow(this.user.id);
    }
  }
}
