import { Component } from '@angular/core';
import {ImageUploadComponent} from "../image-upload/image-upload.component";
import {UserProfileService} from "../../../../shared/services/user-profile/user-profile.service";
import {Post} from "../../../../shared/types/Post.type";
import {PostPublishingService} from "../../../../shared/services/post-publishing/post-publishing.service";

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    ImageUploadComponent
  ],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css'
})
export class PostFormComponent {

  selectedFile: File | null = null;

  constructor(private publishingService: PostPublishingService) { }

  onFileSelected(file: File): void {
    this.selectedFile = file;
  }

  postPost(value: string) {
    if(value.length <= 10){
      console.log("Not enough content");
      return;
    }
    this.publishingService.publishPost(value, this.selectedFile).then(r => console.log("Post successful"));
  }

}
