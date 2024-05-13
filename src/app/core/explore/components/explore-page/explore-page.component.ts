import { Component } from "@angular/core";
import { FoafService } from "../../services/foaf/foaf.service";
import { ForceGraphComponent } from "../force-graph/force-graph.component";
import { SidePeekComponent } from "../side-peek/side-peek.component";
import { SuggestionsViewComponent } from "../suggestions-view/suggestions-view.component";

@Component({
  selector: "app-explore-page",
  standalone: true,
  imports: [ForceGraphComponent, SidePeekComponent, SuggestionsViewComponent],
  templateUrl: "./explore-page.component.html",
  styleUrl: "./explore-page.component.css",
})
export class ExplorePageComponent {
  constructor(private foaf: FoafService) {}
}
