import { Component } from '@angular/core';
import {PostTimelineComponent} from "../post-timeline/post-timeline.component";

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [
    PostTimelineComponent
  ],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.css'
})
export class FeedPageComponent {

}
