import {Component, OnInit, TemplateRef} from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostListService } from "../../../../shared/services/post-extraction/post-extraction.service";
import { Post } from "../../../../shared/types/Post.type";
import {NgForOf, NgIf, NgIfContext} from "@angular/common";
import {User} from "@supabase/supabase-js";
import {PostSuggestionService} from "../../services/post-suggestion/post-suggestion.service";
import {SupabaseService} from "../../../../shared/services/supabase/supabase.service";


@Component({
  selector: 'app-post-timeline',
  standalone: true,
  imports: [PostComponent, NgForOf, NgIf],
  templateUrl: './post-timeline.component.html',
  styleUrls: ['./post-timeline.component.css']
})

export class PostTimelineComponent implements OnInit {

  private supabase = this.supabaseService.client;
  posts: Post[] = [];

  constructor(private postService: PostListService, private supabaseService: SupabaseService) {
    this.supabase.channel('posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, this.handleInserts)
      .subscribe();
  }

  handleInserts = async (payload: any) => {
    console.log('New post !');
    //console.log(payload);
    const formattedName = await this.formatName(payload.new.created_by);
    const newPost: Post = {
      id: payload.new.id,
      content: payload.new.content,
      timestamp: new Date(payload.new.created_at),
      author: formattedName,
      authorNumber: payload.new.created_by,
    };
    this.posts.unshift(newPost);
  }

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

  private async formatName(user_id: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("name, last_name")
      .eq("id", user_id)
      .limit(1);

    if (error) {
      console.error(error);
      return "";
    }

    if (data.length === 0) {
      return user_id.substring(0, 10);
    }
    const name = data[0].name;
    const lastName = data[0].last_name;

    return `${name} ${lastName}`;
  }

  async fetchRecommendedPosts(): Promise<void> {
    // this.suggestionPosts = await this.postSuggestionService.
  }
}
