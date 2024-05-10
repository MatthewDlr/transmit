import { Component, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, effect } from "@angular/core";
import * as d3 from "d3";
import { FoafService } from "../../services/foaf.service";
import { GraphLink } from "../../types/GraphLink.type";
import { GraphNode } from "../../types/GraphNode.type";
import { Subject } from "rxjs";

@Component({
  selector: "app-force-graph",
  standalone: true,
  imports: [],
  templateUrl: "./force-graph.component.html",
  styleUrl: "./force-graph.component.css",
})
export class ForceGraphComponent implements OnDestroy, OnChanges {
  links: GraphLink[] = [];
  nodes: GraphNode[] = [];
  private destroy$ = new Subject<void>();

  constructor(private foafService: FoafService) {
    effect(() => {
      const isLoading = this.foafService.isLoading();
      if (isLoading) return;

      this.links = this.foafService.getLinks();
      this.nodes = this.foafService.getNodes();

      this.chart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["links"] || changes["nodes"]) {
      this.chart();
    }
  }

  public chart = () => {
    // Specify the dimensions of the chart.
    const width = 928;
    const height = 680;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = this.links.map((d) => ({ ...d }));
    const nodes = this.nodes.map((d) => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => (d as any).id),
      )
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // Create the SVG container.
    const svg = d3
      .select("#chart") // select the container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => (d.radius + 1))
      .attr("fill", (d) => color(String(d.depth)));

    node.append("title").text((d) => d.id);

    // Add a drag behavior.

    node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any);

    // Set the position attributes of links and nodes each time the simulation ticks.
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.y as number)
        .attr("y1", (d) => d.source.y as number)
        .attr("x2", (d) => d.target.x as number)
        .attr("y2", (d) => d.target.y as number);

      node.attr("cx", (d) => d.x as number).attr("cy", (d) => d.y as number);
    });

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // When this cell is re-run, stop the previous simulation. (This doesn’t
    // really matter since the target alpha is zero and the simulation will
    // stop naturally, but it’s a good practice.)
    this.destroy$.subscribe(() => simulation.stop());

    return svg.node();
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}