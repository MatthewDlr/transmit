import {Component, OnInit, Input, effect} from '@angular/core';
import {DatePipe, NgIf} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHeart} from "@fortawesome/free-solid-svg-icons/faHeart";
import {Post} from "../../shared/types/Post.type";
import {PostListService} from "../../shared/services/post-extraction/post-extraction.service";

@Component({
  selector: 'app-christmas-post',
  standalone: true,
  templateUrl: './christmaspost.component.html',
  imports: [
    NgIf,
    DatePipe,
    FaIconComponent
  ],
  styleUrls: ['./christmaspost.component.css']
})

export class ChristmaspostComponent {
  isLiked: boolean = false;
  post: Post | undefined = undefined; // initialize the post property as undefined

  constructor(private postService: PostListService) {
    effect(async () => {
      this.isLiked = await postService.isChristmasPostLiked();
    });
  }

  likeChristmasPost() {
    this.isLiked = true;
    this.postService.likeChristmasPost().then(r => {});
  }

  unlikeChristmasPost() {
    this.isLiked = false;
  }

  protected readonly faHeart = faHeart;
}
