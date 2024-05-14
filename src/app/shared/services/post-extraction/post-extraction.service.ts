import { Injectable, WritableSignal, effect, signal } from "@angular/core";
import { AuthService } from "../../../auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";
import {Post} from "../../types/Post.type";

@Injectable({
  providedIn: "root",
})
export class PostListService {
  private supabase = this.supabaseService.client;
  user: User | undefined;
  postList: WritableSignal<Post[] | null> = signal(null);

  constructor(private auth: AuthService, private supabaseService: SupabaseService) {
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
    const { data, error } = await this.supabase
      .from("posts")
      .select("id, created_at, created_by, content, profiles(name, last_name), picture_url");

    if (error) throw error;
    if (!data) throw new Error("No post in database");

    const posts: Post[] = data.map((item: any) => ({
      id: item.id,
      content: item.content,
      timestamp: new Date(item.created_at),
      author: `${item.profiles.name} ${item.profiles.last_name}`,
      authorNumber: `${item.created_by}`,
      image: item.picture_url ? (this.supabase.storage.from('post-images').getPublicUrl(item.picture_url)).data.publicUrl : "",
    }));

    return posts;
  }


}
