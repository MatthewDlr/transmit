import {Component, effect, OnInit} from '@angular/core';
import {PostListService} from "../../../../shared/services/post-extraction/post-extraction.service";
import {UserProfile} from "../../../../shared/types/Profile.type";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {Post} from "../../../../shared/types/Post.type";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {faHeart} from "@fortawesome/free-solid-svg-icons/faHeart";
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
export class MyPostsPageComponent implements OnInit {

  user!: UserProfile;
  myPosts: Post[] = [];
  myPostsWithImages: Post[] = [];
  myPostsWithoutImages: Post[] = [];

  constructor(private userService: UserProfileService, private postService: PostListService) {
    effect(() => {
      const user = this.userService.userProfile();
      if (user !== null) this.user = user;
    });

  }

  ngOnInit(): void {
    this.fetchPosts().then(r => console.log("OK"));
  }

  async fetchPosts(): Promise<void> {
    try {
      this.myPosts = await this.postService.getPostList();
      this.myPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.myPostsWithImages = this.myPosts.filter(post => post.image !== '');
      this.myPostsWithoutImages = this.myPosts.filter(post => !post.image || post.image === '');
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  protected readonly faHeart = faHeart;

  deletePost(id: number) {

  }
}
