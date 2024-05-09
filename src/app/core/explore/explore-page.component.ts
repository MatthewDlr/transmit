import { Component } from "@angular/core";
import { FoafService } from "./foaf-graph/services/foaf.service";

@Component({
  selector: "app-explore-page",
  standalone: true,
  imports: [],
  templateUrl: "./explore-page.component.html",
  styleUrl: "./explore-page.component.css",
})
export class ExplorePageComponent {
  constructor(private foaf: FoafService) {}
}
