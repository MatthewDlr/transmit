import { GraphLink } from "./GraphLink.type";
import { GraphNode } from "./GraphNode.type";

export class AdjacencyNodeList {
  private nodes: Map<GraphNode, Set<string>>;
  public processedUsers: Set<string> = new Set();

  constructor() {
    this.nodes = new Map();
  }

  public addNode(id: string, depth: number, radius = 0) {
    this.nodes.forEach((_, user) => {
      if (user.id === id) return;
    });
    this.nodes.set({ id, depth: depth, radius: radius }, new Set());
  }

  public addLinks(source: string, targets: string[], depth: number) {
    const sourceNode: GraphNode | undefined = this.getNode(source);

    if (!sourceNode) {
      this.addNode(source, depth);
      this.addLinks(source, targets, depth);
    } else {
      targets.forEach((target) => {
        this.nodes.get(sourceNode)!.add(target);
        this.incrementRadius(target, depth + 1);
      });
    }
  }

  private incrementRadius(nodeID: string, depth: number) {
    const node = this.getNode(nodeID);
    if (node) {
      node.radius++;
    } else {
      this.addNode(nodeID, depth, 1);
    }
  }

  private getLinksOf(id: string): string[] {
    const node = this.getNode(id);
    if (node) {
      return Array.from(this.nodes.get(node)!);
    } else {
      return [];
    }
  }

  private hasLink(id: string, friend: GraphNode): boolean {
    const node = this.getNode(id);
    if (node) {
      return this.nodes.get(node)!.has(friend.id);
    } else {
      return false;
    }
  }

  private hasNode(id: string): boolean {
    this.nodes.forEach((_, user) => {
      if (user.id === id) return true;
      return;
    });
    return false;
  }

  private getNode(id: string): GraphNode | undefined {
    return Array.from(this.nodes.keys()).find((user) => user.id === id);
  }

  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.keys());
  }

  public getLinks(): GraphLink[] {
    const links: GraphLink[] = [];
    this.nodes.forEach((values, node) => {
      values.forEach((value) => {
        const link: GraphLink = {
          source: node.id,
          target: value,
          values: 2,
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
