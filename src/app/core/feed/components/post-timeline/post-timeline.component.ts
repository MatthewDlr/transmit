import {Component, effect, OnInit, TemplateRef} from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostListService } from "../../../../shared/services/post-extraction/post-extraction.service";
import { Post } from "../../../../shared/types/Post.type";
import {NgClass, NgForOf, NgIf, NgIfContext} from "@angular/common";
import {SupabaseService} from "../../../../shared/services/supabase/supabase.service";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {UserProfile} from "../../../../shared/types/Profile.type";
import {AuthService} from "../../../../auth/services/auth.service";
import {User} from "@supabase/supabase-js";
import {ChristmaspostComponent} from "../../../../eastereggs/christmas-post/christmaspost.component";
import {CommentService} from "../../../../shared/services/comment/comment.service";
import { Comment } from "../../../../shared/types/Comment.type";


@Component({
  selector: 'app-post-timeline',
  standalone: true,
    imports: [PostComponent, NgForOf, NgIf, NgClass, ChristmaspostComponent],
  templateUrl: './post-timeline.component.html',
  styleUrls: ['./post-timeline.component.css']
})

export class PostTimelineComponent implements OnInit {

  private supabase = this.supabaseService.client;
  followedIDs: string[] = []
  posts: Post[] = [];
  incomingPosts: Post[] = [];
  user!: User | undefined;
  loadPostsVisible: boolean = false;
  showChristmasPosts: boolean = false;

  constructor(private postService: PostListService, private supabaseService: SupabaseService,
              private userService: UserProfileService, private auth: AuthService) {
    this.supabase.channel('posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, this.handleInserts)
      .subscribe();

    this.supabase.channel('comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, this.handleComments)
      .subscribe();

    effect(async () => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;
      this.followedIDs = await this.userService.getFollowedUsers();
    });
  }

  handleInserts = async (payload: any) => {
    console.log('New post !')
    const formattedName = await this.formatName(payload.new.created_by);
    const newPost: Post = {
      comments: [],
      image: payload.new.image,
      id: payload.new.id,
      content: payload.new.content,
      timestamp: new Date(payload.new.created_at),
      author: formattedName,
      authorNumber: payload.new.created_by,
    };
    if(this.followedIDs.includes(payload.new.created_by))  {
      this.incomingPosts.unshift(newPost);
      setTimeout(() => {
        this.loadPostsVisible = true;
      }, 1);
    }
  }

  handleComments = async (payload: any) => {
    console.log(payload);
    const comment: Comment = {
      id: payload.new.id,
      post_id: payload.new.post_id,
      author: payload.new.author,
      authorNumber: payload.new.author_id,
      content: payload.new.content,
      created_at: payload.new.created_at,
    }
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i].id === comment.post_id) {
        this.posts[i].comments.push(comment);
        break;
      }
    }
  }

  ngOnInit(): void {
    this.fetchPosts().then(async () => {
      if(!(await this.postService.isChristmasPostLiked())){
        if (this.posts.length > 10 && this.isTimeBetweenNoonAndNoon25()) {
          setTimeout(() => {
            let audio = new Audio();
            audio.src = "assets/sounds/vivelevent_trimmed.mp3";
            audio.load();
            audio.volume = 0.2;
            audio.play().then(r => this.showChristmasPosts = true);
          }, 10000);
        }
      }
    });
  }

  isTimeBetweenNoonAndNoon25(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours === 12 && minutes >= 1 && minutes <= 25;
  }

  async fetchPosts(): Promise<void> {
    try {
      this.posts = await this.postService.getPostList();
      this.posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  private async formatName(user_id: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("name, last_name")
      .eq("id", user_id)
      .limit(1);

    if (error) throw error;

    if (data.length === 0) {
      return user_id.substring(0, 10);
    }
    const name = data[0].name;
    const lastName = data[0].last_name;

    return `${name} ${lastName}`;
  }

  addNewPostsToFeed() {
    this.posts = [...this.incomingPosts, ...this.posts];
    this.loadPostsVisible = false;
    setTimeout(() => {
      this.incomingPosts = [];
    }, 1000);
  }
}
