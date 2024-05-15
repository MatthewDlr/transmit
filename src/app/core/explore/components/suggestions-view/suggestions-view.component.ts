import { Component, effect } from "@angular/core";
import { SuggestionsService } from "../../services/suggestions/suggestions.service";
import { UserProfile } from "../../../../shared/types/Profile.type";

@Component({
  selector: "app-suggestions-view",
  standalone: true,
  imports: [],
  templateUrl: "./suggestions-view.component.html",
  styleUrl: "./suggestions-view.component.css",
})
export class SuggestionsViewComponent {
  users: UserProfile[] = [
    {
      id: "1",
      updated_at: "lalallalalla",
      name: "Matt",
      last_name: "Dlr",
    },
  ];

  constructor(private suggestionsService: SuggestionsService) {
    return;
    effect(() => {
      this.users = this.suggestionsService.suggestions();
    });
  }
}
