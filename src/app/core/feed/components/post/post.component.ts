import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../../../../shared/types/Post.type';
import {DatePipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  imports: [
    NgIf,
    DatePipe
  ],
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;

  ngOnInit(): void {

  }
}
