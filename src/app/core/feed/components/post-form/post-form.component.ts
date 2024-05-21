import {Component, OnInit, ViewChild} from '@angular/core';
import {ImageUploadComponent} from "../image-upload/image-upload.component";

import {PostPublishingService} from "../../../../shared/services/post-publishing/post-publishing.service";
import {NgClass, NgIf} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons/faTimesCircle";

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    ImageUploadComponent,
    NgIf,
    NgClass,
    FaIconComponent
  ],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css'
})
export class PostFormComponent implements OnInit {

  selectedFile: File | null = null;

  @ViewChild('imageUpload')
  imageUpload!: ImageUploadComponent;
  message: string | null = null;
  isPopupVisible: boolean = false;
  isError: boolean = false;

  constructor(private publishingService: PostPublishingService) { }

  ngOnInit(): void {

  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
  }

  postPost(value: string) {
    if(value.length <= 5){
      this.isError = true;
      this.message = "Text is too short.";
      this.isPopupVisible = true;
      setTimeout(() => {
        this.isPopupVisible = false;
        setTimeout(() => {
          this.message = null;
          this.isError = false;
        }, 1000);
      }, 4000);
      return;
    }
    this.publishingService.publishPost(value, this.selectedFile).then(() => {
      this.message = "Post successful";
      this.isPopupVisible = true;
      setTimeout(() => {
        this.isPopupVisible = false;
        setTimeout(() => {
          this.message = null;
        }, 1000);
      }, 4000);
      this.selectedFile = null;
      const textInput = document.querySelector('#textInput') as HTMLTextAreaElement;
      if(textInput){
        textInput.value = '';
      }
      this.imageUpload.reset();
    }).catch(()=> {
      this.message = "An error occurred. Please try again.";
      this.isError = true;
      this.isPopupVisible = true;
      setTimeout(() => {
        this.isPopupVisible = false;
        setTimeout(() => {
          this.message = null;
          this.isError = false;
        }, 1000);
      }, 4000);

    });
  }

  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faTimesCircle = faTimesCircle;
}
