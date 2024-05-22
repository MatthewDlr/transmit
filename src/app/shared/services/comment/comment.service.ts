import {effect, Injectable} from '@angular/core';
import {UserProfileService} from "../user-profile/user-profile.service";
import {SupabaseService} from "../supabase/supabase.service";
import {AuthService} from "../../../auth/services/auth.service";
import {User} from "@supabase/supabase-js";
import {Post} from "../../types/Post.type";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  user: User | undefined;

  constructor(private auth: AuthService, private supabase: SupabaseService) {
    effect(() => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;

    });
  }

  async commentPost(post: Post, value: string) {
    const {error: insertError} = await this.supabase.client
      .from("comments")
      .insert(
        [{post_id: post.id, author_id: this.user?.id, content: value, author: post.author}]
      );
    if (insertError) throw insertError;
  }
}
