import { SimulationLinkDatum } from "d3";
import { GraphNode } from "./GraphNode.interface";

export class AdjacencyNodeList {
  private nodes: Map<GraphNode, Set<string>>;

  constructor() {
    this.nodes = new Map();
  }

  // Add new user in the keys
  public addUser(userID: string, depth: number, numberOfFollowers = 0): GraphNode {
    let user: GraphNode | undefined = this.getUserFromID(userID);
    if (user) return user;

    user = { id: userID, depth: depth, numberOfFollowers: numberOfFollowers };
    this.nodes.set(user, new Set());
    return user;
  }

  // Add a new friend (target) for a given person (source)
  public addFriend(user: GraphNode, friend: GraphNode) {
    this.nodes.get(user)!.add(friend.id);
    friend.numberOfFollowers += 1;
  }

  // Get a user (key) with his ID
  public getUserFromID(id: string): GraphNode | undefined {
    return Array.from(this.nodes.keys()).find((user) => user.id === id);
  }

  // Get all user of the list
  public getUsers(): GraphNode[] {
    return Array.from(this.nodes.keys());
  }

  // Get of friends of all user in the form of source -> tagret
  public getLinks(): SimulationLinkDatum<GraphNode>[] {
    const links: SimulationLinkDatum<GraphNode>[] = [];
    this.nodes.forEach((friendsID, user) => {
      friendsID.forEach((friendID) => {
        const link: SimulationLinkDatum<GraphNode> = {
          source: user.id,
          target: friendID,
        };
        links.push(link);
      });
    });
    return links;
  }

  public print() {
    console.log(this.nodes);
  }

  public clear() {
    this.nodes.clear();
  }
}
