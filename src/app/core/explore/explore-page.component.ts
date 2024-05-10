import { Component } from "@angular/core";
import { FoafService } from "./foaf-graph/services/foaf.service";
import { ForceGraphComponent } from "./foaf-graph/components/force-graph/force-graph.component";

@Component({
  selector: "app-explore-page",
  standalone: true,
  imports: [ForceGraphComponent],
  templateUrl: "./explore-page.component.html",
  styleUrl: "./explore-page.component.css",
})
export class ExplorePageComponent {
  constructor(private foaf: FoafService) {}
}
