import { SimulationLinkDatum } from "d3";
import { GraphNode } from "./GraphNode.interface";

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: number;
}
