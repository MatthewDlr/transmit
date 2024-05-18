import {Component, OnInit, TemplateRef} from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostListService } from "../../../../shared/services/post-extraction/post-extraction.service";
import { Post } from "../../../../shared/types/Post.type";
import {NgForOf, NgIf, NgIfContext} from "@angular/common";
import {User} from "@supabase/supabase-js";
import {PostSuggestionService} from "../../services/post-suggestion/post-suggestion.service";


@Component({
  selector: 'app-post-timeline',
  standalone: true,
  imports: [PostComponent, NgForOf, NgIf],
  templateUrl: './post-timeline.component.html',
  styleUrls: ['./post-timeline.component.css']
})

export class PostTimelineComponent implements OnInit {
  posts: Post[] = [];
  suggestionPosts: Post[] = [];
  emptyPostList: TemplateRef<NgIfContext<boolean>> | undefined;

  constructor(private postService: PostListService, private postSuggestionService: PostSuggestionService) { }

  ngOnInit(): void {
    this.fetchPosts().then(r => console.log("OK"));
  }

  async fetchPosts(): Promise<void> {
    try {
      this.posts = await this.postService.getPostList();
      this.posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  async fetchRecommendedPosts(): Promise<void> {
    // this.suggestionPosts = await this.postSuggestionService.
  }
}
