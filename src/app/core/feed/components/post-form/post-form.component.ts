import {Component, OnInit, ViewChild} from '@angular/core';
import {ImageUploadComponent} from "../image-upload/image-upload.component";

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
export class PostFormComponent implements OnInit {

  selectedFile: File | null = null;

  @ViewChild('imageUpload')
  imageUpload!: ImageUploadComponent;

  constructor(private publishingService: PostPublishingService) { }

  ngOnInit(): void {

  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
  }

  postPost(value: string) {
    if(value.length <= 5){
      console.log("Not enough content");
      return;
    }
    this.publishingService.publishPost(value, this.selectedFile).then(r => {
      console.log("Post successful");
      this.selectedFile = null;
      const textInput = document.querySelector('#textInput') as HTMLTextAreaElement;
      if(textInput){
        textInput.value = '';
      }
      this.imageUpload.reset();
    });
  }

}
