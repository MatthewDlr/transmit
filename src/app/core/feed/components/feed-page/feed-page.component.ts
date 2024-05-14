import { Component } from '@angular/core';
import {PostTimelineComponent} from "../post-timeline/post-timeline.component";
import {PostFormComponent} from "../post-form/post-form.component";

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [
    PostTimelineComponent,
    PostFormComponent
  ],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.css'
})
export class FeedPageComponent {

}
