import { Component, effect } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { SidePeekService } from "../../services/side-peek/side-peek.service";
import { Interest } from "../../../../shared/types/Interest.type";

@Component({
  selector: "app-side-peek",
  standalone: true,
  imports: [],
  templateUrl: "./side-peek.component.html",
  styleUrl: "./side-peek.component.css",
})
export class SidePeekComponent {
  currentUser: UserProfile | null = null;
  interests: Interest[] | null = null;
  distanceFromYou: number | null = null;
  numberOfFollowers: number | null = null;

  constructor(private sidePeekService: SidePeekService) {
    effect(() => {
      this.currentUser = this.sidePeekService.currentUser();
      this.interests = this.sidePeekService.userInterests();
      this.distanceFromYou = this.sidePeekService.distanceFromYou();
      this.numberOfFollowers = this.sidePeekService.numberOfFollowers();
    });
  }
}
