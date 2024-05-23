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

  public async getPostList(): Promise<Post[]> {
    const scoreToPosts: Map<Post,number> = new Map();

    const getMyInterests = await this.userService.getMyInterests();
    const getMyInterestsString: string[] = [];
    for (const myTag of getMyInterests) {
      if (myTag.followed){
        getMyInterestsString.push(myTag.name);
      }
    }

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

    for (const post of posts) {
      post.comments = await this.getCommentList(post.id);
      // Score for Date
      const now = new Date();
      const differenceInDays = Math.floor((now.getTime() - post.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      const scoreForDate: number = Math.exp((-1)*differenceInDays);
      scoreToPosts.set(post, scoreForDate);

      // TODO : Score for depth
      const postAuthor = await this.foafService.getProfileOf(post.authorNumber);

      // Score for tags
      const targetUserId = post.author;
      const targetUserInterests = await this.userService.getInterestsOf(targetUserId);
      const targetUserInterestString: string[] = [];
      for (const targetUserInterest of targetUserInterests){
        if (targetUserInterest.followed){
          targetUserInterestString.push(targetUserInterest.name);
        }
      }
      let commonCount = 0;
      getMyInterestsString.forEach(value => {
        if (targetUserInterestString.includes(value)) {
          commonCount++;
        }
      });

      let totalCount = getMyInterestsString.length + targetUserInterestString.length;
      let jacquardIndex = commonCount/(totalCount - commonCount)

      // Final score ---
      scoreToPosts.set(post, jacquardIndex + scoreForDate);

    }
    console.log(scoreToPosts);
    return posts;
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
