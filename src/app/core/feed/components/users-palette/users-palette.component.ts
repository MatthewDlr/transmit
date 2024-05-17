import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, effect } from "@angular/core";
import { UsersPaletteService } from "../../services/users-palette/users-palette.service";
import { UserProfile } from "../../../../shared/types/Profile.type";
import { Router } from "@angular/router";

@Component({
  selector: "app-users-palette",
  standalone: true,
  imports: [],
  templateUrl: "./users-palette.component.html",
  styleUrl: "./users-palette.component.css",
})
export class UsersPaletteComponent implements AfterViewInit {
  users: UserProfile[] = [];
  @ViewChild("search") searchInput!: ElementRef;

  constructor(private usersPaletteService: UsersPaletteService, private router: Router) {
    effect(() => {
      this.users = this.usersPaletteService.searchResults();
    });
  }

  @HostListener("document:keydown.enter", ["$event"])
  @HostListener("document:keydown.escape", ["$event"])
  onKeydownHandlerEscape() {
    this.closeModal();
  }

  ngAfterViewInit(): void {
    this.searchInput.nativeElement.focus();
  }

  public searchUser(query: string) {
    this.usersPaletteService.search(query);
  }

  public closeModal() {
    this.usersPaletteService.isEnabled.set(false);
  }

  public openUserPage(id: string) {
    this.closeModal()
    this.router.navigate(["/explore/user/" + id]);
  }
}
