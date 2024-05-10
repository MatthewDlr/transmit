import { SimulationLinkDatum } from "d3";
import { GraphNode } from "./GraphNode.type";

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
  value: number;
}