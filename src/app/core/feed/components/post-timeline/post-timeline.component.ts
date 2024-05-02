import { Component, OnInit } from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostListService } from "../../../../shared/services/post-extraction/post-extraction.service";
import { Post } from "../../../../shared/types/Post.type";
import {NgForOf} from "@angular/common";


@Component({
  selector: 'app-post-timeline',
  standalone: true,
  imports: [ PostComponent, NgForOf],
  templateUrl: './post-timeline.component.html',
  styleUrls: ['./post-timeline.component.css']
})

export class PostTimelineComponent implements OnInit {
  posts: Post[] = [];

  constructor(private postService: PostListService) { }

  ngOnInit(): void {
    this.fetchPosts().then(r => console.log("OK"));
  }

  async fetchPosts(): Promise<void> {
    try {
      this.posts = await this.postService.getPostList();
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
}
