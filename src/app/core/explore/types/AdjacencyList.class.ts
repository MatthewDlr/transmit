import { SimulationLinkDatum } from "d3";
import { GraphNode } from "./GraphNode.interface";

export class AdjacencyNodeList {
  private nodes: Map<GraphNode, Set<GraphNode>>;
  public processedUsers: Set<string> = new Set();

  constructor() {
    this.nodes = new Map();
  }

  // Add new user in the keys
  public addNode(id: string, depth: number, radius = 0) {
    this.nodes.forEach((_, user) => {
      if (user.id === id) return;
    });
    this.nodes.set({ id, depth: depth, radius: radius }, new Set());
  }

  // Add a new friend (target) for a given person (source)
  public addLinks(source: string, targets: string[], depth: number) {
    const sourceNode: GraphNode | undefined = this.getNode(source);

    if (!sourceNode) {
      this.addNode(source, depth);
      this.addLinks(source, targets, depth);
    } else {
      targets.forEach((target) => {
        this.nodes.get(sourceNode)!.add({ id: target, depth: depth + 1, radius: 0 });
        this.incrementRadius(target, depth + 1);
      });
    }
  }

  // Register a new follower for a given user ID
  private incrementRadius(nodeID: string, depth: number) {
    const node = this.getNode(nodeID);
    if (node) {
      node.radius++;
    } else {
      this.addNode(nodeID, depth, 1);
    }
  }

  // Get a user (key) with his ID
  private getNode(id: string): GraphNode | undefined {
    return Array.from(this.nodes.keys()).find((user) => user.id === id);
  }

  // Get all user of the list
  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.keys());
  }

  // Get of friends of all user in the form of source -> tagret
  public getLinks(): SimulationLinkDatum<GraphNode>[] {
    const links: SimulationLinkDatum<GraphNode>[] = [];
    this.nodes.forEach((values, node) => {
      values.forEach((value) => {
        const link: SimulationLinkDatum<GraphNode> = {
          source: node.id,
          target: value.id,
        };
        links.push(link);
      });
    });
    return links;
  }

  public print() {
    console.log(this.nodes);
  }
}
