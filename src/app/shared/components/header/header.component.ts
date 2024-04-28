import { CommonModule } from "@angular/common";
import { Component, effect } from "@angular/core";
import { Router } from "@angular/router";

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
