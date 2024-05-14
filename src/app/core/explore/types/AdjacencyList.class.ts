import { SimulationLinkDatum } from "d3";
import { GraphNode } from "./GraphNode.interface";

export class AdjacencyNodeList {
  private nodes: Map<GraphNode, Set<string>>;
  public processedUsers: Set<string> = new Set();

  constructor() {
    this.nodes = new Map();
  }

  // Add new user in the keys
  public addUser(id: string, depth: number, numberOfFollowers = 0): GraphNode {
    this.nodes.forEach((_, user) => {
      if (user.id === id) return;
    });

    const userNode: GraphNode = { id, depth: depth, numberOfFollowers: numberOfFollowers };
    this.nodes.set(userNode, new Set());
    return userNode;
  }

  // Add a new friend (target) for a given person (source)
  public addFriends(userID: string, friendsToAdd: string[], userDepth: number) {
    let user: GraphNode | undefined = this.getNode(userID);
    if (!user) user = this.addUser(userID, userDepth);

    friendsToAdd.forEach((friendID) => {
      this.nodes.get(user!)!.add(friendID);
      this.incrementFriendsCount(friendID, userDepth + 1);
    });

    this.processedUsers.add(userID)
  }

  // Register a new follower for a given user ID
  private incrementFriendsCount(userID: string, userDepth: number) {
    let user: GraphNode | undefined = this.getNode(userID);
    if (!user) user = this.addUser(userID, userDepth);

    user.numberOfFollowers++;
  }

  // Get a user (key) with his ID
  private getNode(id: string): GraphNode | undefined {
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
}
