import { Injectable, WritableSignal, signal } from "@angular/core";
import { UserProfile } from "../../../../shared/types/Profile.type";

@Injectable({
  providedIn: "root",
})
export class UsersPaletteService {
  public isEnabled: WritableSignal<boolean> = signal(false);
  public searchResults : WritableSignal<UserProfile[]> = signal([])

  constructor() {}
}
