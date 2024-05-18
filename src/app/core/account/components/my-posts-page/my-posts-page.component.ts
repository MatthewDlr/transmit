import {Component, effect } from '@angular/core';
import {PostListService} from "../../../../shared/services/post-extraction/post-extraction.service";
import {UserProfile} from "../../../../shared/types/Profile.type";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {Post} from "../../../../shared/types/Post.type";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-my-posts-page',
  standalone: true,
  imports: [
    NgForOf,
    DatePipe,
    FaIconComponent,
    NgIf
  ],
  templateUrl: './my-posts-page.component.html',
  styleUrl: './my-posts-page.component.css'
})
export class MyPostsPageComponent {

  user!: UserProfile;
  allPosts: Post[] = [];
  myPostsWithImages: Post[] = [];
  myPostsWithoutImages: Post[] = [];

  constructor(private userService: UserProfileService, private postService: PostListService) {
    effect(() => {
      const user = this.userService.userProfile();
      if (user !== null) this.user = user;
      this.fetchPosts().then(() => console.log("Posts fetched"));
    });

  }

  async fetchPosts(): Promise<void> {
    if (this.user !== undefined) {
      try {
        this.allPosts = await this.postService.getPostList();
        this.allPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        this.myPostsWithImages = this.allPosts.filter(
          post => post.authorNumber === this.user.id && post.image !== ''
        );
        this.myPostsWithoutImages = this.allPosts.filter(
          post => post.authorNumber === this.user.id && (!post.image || post.image === '')
        );
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  }

  deletePost(id: number) {
    this.postService.deletePost(id).then(() => "Post successfully deleted");
    this.myPostsWithImages = this.myPostsWithImages.filter(post => post.id !== id);
    this.myPostsWithoutImages = this.myPostsWithoutImages.filter(post => post.id !== id);
  }
}
