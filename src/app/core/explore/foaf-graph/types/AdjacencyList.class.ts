import { GraphUser } from "./GraphUser.type";

export class AdjacencyFriendsList {
  private users: Map<string, Set<GraphUser>>;

  constructor() {
    this.users = new Map();
  }

  addUser(id: string) {
    if (this.users.has(id)) return;
    this.users.set(id, new Set());
  }

  addFriends(id: string, friends: GraphUser[]) {
    const userFriends = this.users.get(id);
    if (userFriends) {
      friends.forEach((friend) => userFriends.add(friend));
    } else {
      this.addUser(id);
      this.addFriends(id, friends);
    }
  }

  getFriendsOf(id: string): GraphUser[] {
    const userFriends = this.users.get(id);
    if (userFriends) {
      return Array.from(userFriends);
    }
    return [];
  }

  hasFriend(id: string, friend: GraphUser): boolean {
    return Boolean(this.users.get(id)?.has(friend));
  }

  hasUser(id: string): boolean {
    return this.users.has(id);
  }

  getUsers(): Map<string, Set<GraphUser>> {
    return this.users;
  }
}
