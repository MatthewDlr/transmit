import {Component, effect } from "@angular/core";
import { LogoutFormComponent } from "../../../../auth/components/logout-form/logout-form.component";
import { UserProfileService } from "../../../../shared/services/user-profile/user-profile.service";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { FormsModule } from "@angular/forms";
import { Interest } from "../../../../shared/types/Interest.type";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {PostPublishingService} from "../../../../shared/services/post-publishing/post-publishing.service";
import {PostListService} from "../../../../shared/services/post-extraction/post-extraction.service";

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
  showChristmasBadge: boolean = false;
  imageUrl: string | undefined = undefined;

  constructor(private userService: UserProfileService, private router: Router,
              private postService: PostPublishingService, private postListService: PostListService) {
    effect(async () => {
      const user = this.userService.userProfile();
      if (user !== null) this.user = user;
      if(this.user.avatar_url){
        this.imageUrl = this.user.avatar_url + "?" + Date.now();
      }
      this.showMyPostsInFeed = await this.userService.doIFollowUser(this.user.id);
      this.showChristmasBadge = await this.postListService.isChristmasPostLiked();
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
      //console.log("file selected : " + this.selectedFile.name)
      if (await this.postService.uploadAvatar(this.selectedFile)){
        //console.log("avatar uploaded");
        await this.setAvatarToLatestUploadedImage();
      }
    }
  }

  async setAvatarToLatestUploadedImage(){
    const url = await this.userService.getUserAvatarUrl();
    if(url !== null){
      this.user.avatar_url = url;
      await this.saveUserProfile();
      this.imageUrl = url + "?" + Date.now();
      console.log("Avatar set to new image");
    } else {
      console.log("No avatar found in database");
    }
  }

  navigateToMyPostsPage() {
    this.router.navigate(["/myposts"]).then(r => "")
  }

  async toggleSeePosts() {
    this.showMyPostsInFeed = !this.showMyPostsInFeed;
    if (this.showMyPostsInFeed) {
      await this.userService.follow(this.user.id);
    } else {
      await this.userService.unfollow(this.user.id);
    }
  }

  navigateToRelationsPage() {
    this.router.navigate(["/relations"]).then(r => "")
  }

  async deletePicture() {
    this.user.avatar_url = undefined;
    await this.saveUserProfile();
    await this.userService.deleteAvatars(this.user.id);
    this.imageUrl = undefined;
  }
}
