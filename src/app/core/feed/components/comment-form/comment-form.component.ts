import {Component, effect, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgClass, NgIf, NgStyle} from "@angular/common";
import {ImageUploadComponent} from "../image-upload/image-upload.component";
import {CommentService} from "../../../../shared/services/comment/comment.service";
import {User} from "@supabase/supabase-js";
import {Post} from "../../../../shared/types/Post.type";

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [
    NgStyle,
    ImageUploadComponent,
    NgClass,
    NgIf
  ],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.css'
})
export class CommentFormComponent {

  @Input() post!: Post;
  showCommentBanner: boolean = false;
  commentFormWidth = '1%';
  commentFormHeight = '0px';
  commentFormOpacity = 0;

  @ViewChild('textInput') textInput!: ElementRef;

  constructor(private commentService: CommentService) {

  }

  toggleBannerAndFocus() {
    this.showCommentBanner = !this.showCommentBanner;
    this.commentFormWidth = '100%';
    this.commentFormHeight = '65px';
    this.commentFormOpacity = 1;
  }

  async postComment(value: string) {
    if(value.length > 5 && value.length < 255) {
      await this.commentService.commentPost(this.post, value).then(() => {
        console.log("Comment successful");
        this.textInput.nativeElement.value = '';
      }).catch(() => {
        console.log("Error");
      });
    }
  }
}
