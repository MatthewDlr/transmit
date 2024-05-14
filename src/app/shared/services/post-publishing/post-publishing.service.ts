import {effect, Injectable, signal, WritableSignal} from '@angular/core';
import {User} from "@supabase/supabase-js";
import {Post} from "../../types/Post.type";
import {AuthService} from "../../../auth/services/auth.service";
import {SupabaseService} from "../supabase/supabase.service";
import {UserProfileService} from "../user-profile/user-profile.service";
import {assert} from "@angular/compiler-cli/linker";

@Injectable({
  providedIn: 'root'
})
export class PostPublishingService {

  private supabase = this.supabaseService.client;
  user: User | undefined;

  constructor(private auth: AuthService, private supabaseService: SupabaseService) {
    effect(() => {
      this.user = this.auth.userSession()?.user;
      if (!this.user) return;
    });
  }

  async publishPost(value: string, file: File | null) {
    if (!this.user) throw new Error("User is not logged in");

    const {error: insertError} = await this.supabase
      .from('posts')
      .insert([
        {created_by: this.user.id, content: value}
      ]);

    if (insertError) throw insertError;

    if (file) {
      const fileName = await this.uploadImage(file);
      console.log(fileName);
      const {error: updateError} = await this.supabase
        .from('posts')
        .update({picture_url: `post-images/${fileName}`})
        .eq('created_by', this.user.id)
        .eq('content', value);

      if (updateError) throw updateError;
    }
  }

  async uploadImage(file: File) {
    if (!this.user) throw new Error("User is not logged in");

    const fileNameParts = file.name.split('.');
    const extension = fileNameParts.pop()?.toLowerCase() || '';

    const { data, error: listError } = await this.supabase
      .storage
      .from('post-images')
      .list();

    if (listError) throw listError;

    // @ts-ignore
    const userImages = data.filter((file: any) => file.name.startsWith(`${this.user.id}_`));
    const imageCount = userImages.length;
    const fileName = `${this.user.id}_${imageCount}.${extension}`;
    const { error: uploadError } = await this.supabase
      .storage
      .from('post-images')
      .upload(`${fileName}`, file);

    if (uploadError) throw uploadError;

    return fileName;
  }

}
