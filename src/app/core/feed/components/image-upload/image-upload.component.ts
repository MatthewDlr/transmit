import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {
  file: File | null = null;
  imageName = '';
  preview = '';

  @Output() fileSelected = new EventEmitter<File>();

  constructor() {}

  ngOnInit(): void {

  }

  selectFile(event: any): void {
    this.imageName = '';
    this.preview = '';
    this.file = event.target.files[0];

    if (this.file && (this.file.type === 'image/jpeg' || this.file.type === 'image/jpg' || this.file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(this.file);

      this.fileSelected.emit(this.file);
    } else {
      console.log('Invalid file type. Please select a JPG, JPEG or PNG file.');
      this.file = null;
    }
  }

}

