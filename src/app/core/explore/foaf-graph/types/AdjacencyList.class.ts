import { Friend } from "./Friend.type";

export class AdjacencyFriendsList {
  private users: Map<string, Set<Friend>>;

  constructor() {
    this.users = new Map();
  }

  addUserId(id: string) {
    if (this.users.has(id)) return;
    this.users.set(id, new Set());
  }

  addFriend(id: string, friend: Friend) {
    const userFriends = this.users.get(id);
    if (userFriends) {
      userFriends.add(friend);
    } else {
      this.addUserId(id);
      this.addFriend(id, friend);
    }
  }

  addFriends(id: string, friends: Friend[]) {
    const userFriends = this.users.get(id);
    if (userFriends) {
      friends.forEach((friend) => userFriends.add(friend));
    } else {
      this.addUserId(id);
      this.addFriends(id, friends);
    }
  }

  getFriendsOf(id: string): Friend[] {
    const userFriends = this.users.get(id);
    if (userFriends) {
      return Array.from(userFriends);
    }
    return [];
  }

  hasFriend(id: string, friend: Friend): boolean {
    return Boolean(this.users.get(id)?.has(friend));
  }

  hasUser(id: string): boolean {
    return this.users.has(id);
  }

  getUsers(): Map<string, Set<Friend>> {
    return this.users;
  }
}
