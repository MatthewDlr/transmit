import { Component, HostListener } from "@angular/core";
import { PostTimelineComponent } from "../post-timeline/post-timeline.component";
import { PostFormComponent } from "../post-form/post-form.component";
import { UsersPaletteService } from "../../services/users-palette/users-palette.service";
import {PostComponent} from "../post/post.component";
import {ChristmaspostComponent} from "../../../../eastereggs/christmas-post/christmaspost.component";

@Component({
  selector: "app-feed-page",
  standalone: true,
  imports: [PostTimelineComponent, PostFormComponent, PostComponent, ChristmaspostComponent],
  templateUrl: "./feed-page.component.html",
  styleUrl: "./feed-page.component.css",
})
export class FeedPageComponent {
  constructor(private usersPaletteService: UsersPaletteService) {}

  // Listen for the cmd+k/ctrl+k to toggle the command palette
  @HostListener("document:keydown.meta.k", ["$event"])
  @HostListener("document:keydown.control.k", ["$event"])
  onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.openUsersPalette();
  }

  public openUsersPalette() {
    this.usersPaletteService.isEnabled.set(true);
  }
}
