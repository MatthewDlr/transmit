import { Injectable, WritableSignal, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";

@Injectable({
  providedIn: "root",
})
export class SuggestionsService {
  suggestions: WritableSignal<Set<UserProfile>> = signal(new Set());

  constructor() {}

  public addSuggestion(user: UserProfile) {
    this.suggestions().add(user);
  }
}
