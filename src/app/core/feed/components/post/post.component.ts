import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../../../../shared/types/Post.type';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {PostListService} from "../../../../shared/services/post-extraction/post-extraction.service";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHeart} from "@fortawesome/free-solid-svg-icons/faHeart";
import {CommentFormComponent} from "../comment-form/comment-form.component";
import { Comment } from "../../../../shared/types/Comment.type";

@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  imports: [
    NgIf,
    DatePipe,
    FaIconComponent,
    CommentFormComponent,
    NgForOf
  ],
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  isLiked : boolean = false;

  constructor(private postService: PostListService) {
  }

  async ngOnInit(): Promise<void> {
    //console.log(this.post.image);
    this.isLiked = await this.postService.isPostLiked(this.post.id);
  }

  likePost() {
    this.isLiked = true;
    this.postService.likePost(this.post.id).then(r => {});
  }

  unlikePost() {
    this.isLiked = false;
    this.postService.unlikePost(this.post.id).then(r => {});
  }

  protected readonly faHeart = faHeart;

}
