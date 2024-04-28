import { CommonModule } from "@angular/common";
import { Component, effect } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../auth/services/auth.service";
import { User } from "@supabase/supabase-js";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent {

  constructor(public router: Router) {
  }
}
