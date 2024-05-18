import { Component, effect } from "@angular/core";
import { SuggestionsService } from "../../services/suggestions/suggestions.service";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { SuggestionTileComponent } from "../suggestion-tile/suggestion-tile.component";

@Component({
  selector: "app-suggestions-view",
  standalone: true,
  imports: [SuggestionTileComponent],
  templateUrl: "./suggestions-view.component.html",
  styleUrl: "./suggestions-view.component.css",
})
export class SuggestionsViewComponent {
  users: Set<UserProfile> = new Set();
  constructor(private suggestionsService: SuggestionsService) {
    effect(() => {
      this.users = this.suggestionsService.users();
    });
  }
}
