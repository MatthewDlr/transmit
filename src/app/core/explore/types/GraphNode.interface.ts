import { SimulationNodeDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
  id: string; // ID of the user profile
  depth: number; // The bigger, the further this person is from the logged in user. 1 means "friend", 2 means "friends of friends" and so on
  radius: number; // Number of people that are following this person (in the ones fetched)
};
