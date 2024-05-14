import { Component } from "@angular/core";
import { FoafService } from "../../services/foaf/foaf.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-depth-control",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./depth-control.component.html",
  styleUrl: "./depth-control.component.css",
})
export class DepthControlComponent {
  isExpanded: boolean = false;
  selectedDepth: number = 2;
  availableDepths: number[] = [1, 2, 3, 4, 5];

  constructor(private foafService: FoafService) {}

  changeDepthTo(depth: number) {
    if (depth === this.selectedDepth) return;

    this.foafService.fetch(depth);
  }
}
