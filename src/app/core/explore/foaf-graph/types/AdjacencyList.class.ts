import { Friend } from "./Friend.type";

export class AdjacencyFriendsList {
  private values;

  constructor() {
    this.values = new Map();
  }

  addUserId(id: string) {
    if (this.values.has(id)) return;
    this.values.set(id, new Set());
  }

  addFriend(id: string, friend: Friend) {
    const userFriends = this.values.get(id);
    if (userFriends) {
      userFriends.add(friend);
    } else {
      this.addUserId(id);
      this.addFriend(id, friend);
    }
  }

  addFriends(id: string, friends: Friend[]) {
    const userFriends = this.values.get(id);
    if (userFriends) {
      friends.forEach((friend) => userFriends.add(friend));
    } else {
      this.addUserId(id);
      this.addFriends(id, friends);
    }
  }

  getFriendsOf(id: string) {
    return this.values.get(id);
  }

  hasFriend(id: string, friend: Friend) {
    return this.values.get(id).has(friend);
  }
}
