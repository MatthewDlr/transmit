import { SimulationNodeDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  depth: number;
  radius: number;
};
