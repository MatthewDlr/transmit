export interface Comment {
  id : string,
  post_id: number;
  created_at: Date;
  author: string;
  authorNumber: string;
  content: string;
}
