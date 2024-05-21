import {Comment} from "./Comment.type";

export interface Post {
  id: number;
  content: string;
  timestamp: Date;
  author: string;
  authorNumber: string;
  image?: string;
  comments: Comment[];
}
