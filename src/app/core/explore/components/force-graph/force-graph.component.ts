import { Component, OnChanges, OnDestroy, SimpleChanges, effect } from "@angular/core";
import * as d3 from "d3";
import { FoafService } from "../../services/foaf/foaf.service";
import { GraphNode } from "../../types/GraphNode.interface";
import { Subject } from "rxjs";
import { SimulationLinkDatum } from "d3";
import { SidePeekService } from "../../services/side-peek/side-peek.service";
import { DepthControlComponent } from "../depth-control/depth-control.component";

@Component({
  selector: "app-force-graph",
  standalone: true,
  imports: [DepthControlComponent],
  templateUrl: "./force-graph.component.html",
  styleUrl: "./force-graph.component.css",
})
export class ForceGraphComponent implements OnDestroy, OnChanges {
  links: SimulationLinkDatum<GraphNode>[] = [];
  nodes: GraphNode[] = [];
  private destroy$ = new Subject<void>();

  constructor(private foafService: FoafService, private sidePeekService: SidePeekService) {
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

  public chart() {
    // Remove all child elements of #chart except for .icon-svg
    d3.select("#chart").selectAll("svg:not(.icon-svg)").remove();

    // Specify the dimensions of the chart.
    const width = window.innerWidth < 800 ? 700 : 900;
    const height = window.innerWidth < 800 ? 400 : 550;
    const self = this;

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links: SimulationLinkDatum<GraphNode>[] = this.links.map((d) => ({ ...d }));
    const nodes: GraphNode[] = this.nodes.map((d) => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .strength(0.015),
      )
      .force("charge", d3.forceManyBody().strength(-500))
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

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10") //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
      .attr("refX", 100) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .classed("fill-secondary-400", true)
      .style("stroke", "none");

    // Zoom behavior, limiting the scale extent to 0.1 to 10
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform);
      });

    const g = svg.append("g");
    svg.call(zoom);

    // Add a line for each link, and a circle for each node.
    const link = svg
      .append("g")
      .classed("stroke-secondary-300", true)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");

    const node = svg
      .append("g")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => 1.25 * (d.numberOfFollowers + 1))
      .attr("refX", (d) => d.numberOfFollowers + 10)
      .on("click", function (event, d) {
        self.sidePeekService.setUser(d.id, d.depth, d.numberOfFollowers);
      })
      .classed("stroke-secondary-50 hover:cursor-pointer", true)
      .classed("fill-primary-950", (d) => d.depth === 0)
      .classed("fill-primary-800", (d) => d.depth === 1)
      .classed("fill-primary-600", (d) => d.depth === 2)
      .classed("fill-primary-400", (d) => d.depth === 3)
      .classed(" fill-primary-200", (d) => d.depth === 4);

    node.append("title").text("Open in side peek");

    // Add a drag behavior.
    node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any);

    // Set the position attributes of links and nodes each time the simulation ticks.
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode)?.x || 0)
        .attr("y1", (d) => (d.source as GraphNode)?.y || 0)
        .attr("x2", (d) => (d.target as GraphNode)?.x || 0)
        .attr("y2", (d) => (d.target as GraphNode)?.y || 0);

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

    this.destroy$.subscribe(() => simulation.stop());
    return svg.node();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
