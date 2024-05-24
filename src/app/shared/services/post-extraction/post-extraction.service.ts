import {effect, Injectable, signal, WritableSignal} from "@angular/core";
import {AuthService} from "../../../auth/services/auth.service";
import {User} from "@supabase/supabase-js";
import {SupabaseService} from "../supabase/supabase.service";
import {Post} from "../../types/Post.type";
import {UserProfileService} from "../user-profile/user-profile.service";
import {Comment} from "../../types/Comment.type";
import {FoafService} from "../../../core/explore/services/foaf/foaf.service";

@Injectable({
  providedIn: "root",
})
export class PostListService {
  private supabase = this.supabaseService.client;
  user: User | undefined;
  postList: WritableSignal<Post[] | null> = signal(null);

  constructor(private auth: AuthService, private supabaseService: SupabaseService, private userService: UserProfileService, private foafService: FoafService) {
    effect(() => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;

      this.getPostList().then((postList) => {
        //console.log("Num posts in DB: " + postList.length);
        this.postList.set(postList);
      });
    });
  }

  private dfsHelper(hashMapUserIndex: Map<string, number>,indexWrapper: { value: number }, userId: string, depth: number, visited: Set<string>, hashMapUserIdDepth: Map<string, number>): void {
    visited.add(userId);
    const friendsId = this.foafService.getFriendsIDsOf(userId);

    for (const friendId of friendsId) {
      if (!visited.has(friendId)) {
        hashMapUserIndex.set(friendId, indexWrapper.value);
        indexWrapper.value += 1;
        hashMapUserIdDepth.set(friendId, depth);
        this.dfsHelper(hashMapUserIndex, indexWrapper, friendId, depth + 1, visited, hashMapUserIdDepth);
      }
    }
  }

  private cosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vector should be same size");
    }

    const dotProduct = vectorA.reduce((acc, value, index) => acc + value * vectorB[index], 0);

    const normA = Math.sqrt(vectorA.reduce((acc, value) => acc + value ** 2, 0));
    const normB = Math.sqrt(vectorB.reduce((acc, value) => acc + value ** 2, 0));

    if (normA === 0 || normB === 0) {
      return 0;
    } else {
      return dotProduct / (normA * normB);
    }
  };

  public async getPostList(): Promise<Post[]> {
    const postsToReturnedSorted: Post[] = [];
    const scoreToPosts: Map<Post, number> = new Map();

    const getMyInterests = await this.userService.getMyInterests();
    const getMyInterestsString: string[] = getMyInterests.filter(tag => tag.followed).map(tag => tag.name);

    const { data, error } = await this.supabase
      .from("posts")
      .select("id, created_at, created_by, content, profiles(name, last_name), picture_url")
      .eq("deleted", false);

    if (error) throw error;
    if (!data) throw new Error("No post in database");

    const posts: Post[] = data.map((item: any) => ({
      id: item.id,
      content: item.content,
      timestamp: new Date(item.created_at),
      author: `${item.profiles.name} ${item.profiles.last_name}`,
      authorNumber: `${item.created_by}`,
      image: item.picture_url ? (this.supabase.storage.from('post-images').getPublicUrl(item.picture_url)).data.publicUrl : "",
      comments: []
    }));

    const hashMapUserIdDepth: Map<string, number> = new Map();
    let hashMapUserIndex: Map<string, number> = new Map();
    const indexWrapper = { value: 0 };

    const fillHashMapUserIdDepth = (indexWrapper: { value: number }, userId: string): void => {
      const visited: Set<string> = new Set<string>();
      this.dfsHelper(hashMapUserIndex, indexWrapper, userId, 1, visited, hashMapUserIdDepth);
    }

    fillHashMapUserIdDepth(indexWrapper, this.userService.getUserID());

    const users = await this.userService.getAllUsers();
    const usersId: string[] = users.map(user => user.id);

    usersId.forEach(userId => {
      if (!hashMapUserIdDepth.has(userId)) {
        hashMapUserIndex.set(userId, indexWrapper.value);
        indexWrapper.value += 1;
        hashMapUserIdDepth.set(userId, -1);
      }
    });

    const matrixUserPostLikes: number[][] = Array.from({ length: users.length }, () => Array(posts.length).fill(0));

    const now = new Date();
    const commentsPromises = posts.map(post => this.getCommentList(post.id));
    const comments = await Promise.all(commentsPromises);

    const fillMatrix = async (posts: Post[], comments: Comment[][]): Promise<number[][]> => {
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        post.comments = comments[i];

        const usersLikePost = await this.getUsersIdThatLikedPostId(post.id);
        for (const userListPost of usersLikePost){
          const userIndex = hashMapUserIndex.get(userListPost);
          if (typeof userIndex !== "undefined"){
            matrixUserPostLikes[userIndex][i] = 1;
          }
        }
      }
      return matrixUserPostLikes;
    }

    let userScoreSimilarity: Map<number, number> = new Map();
    const matrixUserPostLikesComplete = await fillMatrix(posts, comments);
    const myUserId = this.userService.getUserID();
    const userIndex = hashMapUserIndex.get(myUserId);
    if (typeof userIndex !== "undefined") {
      const similarities: number[] = [];
      for (const row of matrixUserPostLikesComplete) {
        similarities.push(this.cosineSimilarity(matrixUserPostLikesComplete[userIndex], row));
      }
      similarities.forEach((similarity, index) => {
        userScoreSimilarity.set(index, similarity);
      });
    }

    for (let i: number = 0; i < posts.length; i++) {
      const post = posts[i];
      const differenceInDays = (now.getTime() - post.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const scoreForDate: number = Math.exp(-0.1 * differenceInDays);

      const targetUserId = post.authorNumber;
      const targetUserInterests = await this.userService.getInterestsOf(targetUserId);
      const targetUserInterestString: string[] = targetUserInterests.filter(interest => interest.followed).map(interest => interest.name);

      const commonCount = getMyInterestsString.filter(value => targetUserInterestString.includes(value)).length;
      const totalCount = getMyInterestsString.length + targetUserInterestString.length;
      const jacquardIndex = commonCount / (totalCount - commonCount);

      // const depth: number = hashMapUserIdDepth.get(targetUserId) ?? -1;
      let scoreForDepth: number = -1;
      const depth = hashMapUserIdDepth.get(targetUserId);
      if (depth !== undefined) {
        if (targetUserId != myUserId){
          scoreForDepth = 1 / depth;
        }
        else {
          scoreForDepth = 1;
        }
      }

      const userIndex = hashMapUserIndex.get(targetUserId);
      let scoreForSimilarity: number = 0;
      if (typeof userIndex !== "undefined"){
        const targetUserScoreSimilarity = userScoreSimilarity.get(userIndex);
        if (typeof targetUserScoreSimilarity !== "undefined"){
          scoreForSimilarity = targetUserScoreSimilarity;
        }
      }
      scoreToPosts.set(post, 0.2*scoreForDate + 0.2*jacquardIndex + 0.4*scoreForDepth + 0.2*scoreForSimilarity);
    }

    const entriesArray = Array.from(scoreToPosts.entries());
    entriesArray.sort((a, b) => b[1] - a[1]);
    postsToReturnedSorted.push(...entriesArray.map(entry => entry[0]));
    console.log(entriesArray);
    return postsToReturnedSorted;
    }

  async isPostLiked(postId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("likes")
      .select()
      .eq("post_liked", postId)
      .eq("liked_by", this.user?.id);

    if (error) throw Error(error.message);
    return data?.length >= 1;
  }

  async likePost(id: number) {
    const { error} = await this.supabase
      .from("likes")
      .insert([
        {post_liked: id, liked_by: this.user?.id},
      ]);
    if (error) throw Error(error.message);
  }

  async getUsersIdThatLikedPostId(postId: number): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("likes")
      .select("liked_by")
      .eq("post_liked", postId);

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return [];
    }
    return data.map((entry: { liked_by: string }) => entry.liked_by);
  }

  async unlikePost(id: number) {
    const { error} = await this.supabase
      .from("likes")
      .delete()
      .eq("post_liked", id)
      .eq("liked_by", this.user?.id);
    if (error) throw Error(error.message);
  }

  async deletePost(id: number) {
    const {error} = await this.supabase
      .from('posts')
      .update({deleted: true})
      .eq('id', id)

    if (error) throw Error(error.message);
  }

  async isChristmasPostLiked() {
    if (!this.user) return;

    const { data, error } = await this.supabase
      .from("eastereggs")
      .select("christmas_found")
      .eq("user_id", this.user?.id);

    if (error) throw Error(error.message);

    return data[0].christmas_found;
  }

  async likeChristmasPost() {
    if (!this.user) return;

    const { error } = await this.supabase
      .from("eastereggs")
      .upsert([
        {
          user_id: this.user.id,
          christmas_found: true,
          christmas_found_at: new Date(),
        },
      ])
      .eq("user_id", this.user.id);

    if (error) throw Error(error.message);
  }

  async getCommentList(id: number): Promise<Comment[]> {
    const { data, error } = await this.supabase
      .from("comments")
      .select("id, post_id, created_at, content, author_id, author")
      .eq("post_id", id);

    if (error) throw error;
    if (!data) throw new Error("No post in database");

    return data.map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      content: item.content,
      created_at: new Date(item.created_at),
      author: item.author,
      authorNumber: `${item.author_id}`,
    }));
  }
}
