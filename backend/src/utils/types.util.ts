import type mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import type { OutputData } from '@editorjs/editorjs';
import { userSchema } from '../schemas/user.schema';
import { blogSchema } from '../schemas/blog.schema';

export type UserSchemaType = InferSchemaType<typeof userSchema>;
export type BlogSchemaType = InferSchemaType<typeof blogSchema>;

export interface SignUpBody {
  fullname: string;
  email: string;
  password: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export interface GenarateDataType {
  access_token: string;
  profile_img: string;
  username: string;
  fullname: string;
}

export interface UserRequestType extends UserSchemaType {
  _id: mongoose.Types.ObjectId;
}

export interface AuthorStructureType {
  fullname?: string;
  email?: string;
  password?: string;
  username?: string;
  bio?: string;
  profile_img?: string;
}

export interface ActivityStructureType {
  total_likes: number;
  total_comments: number;
  total_reads: number;
  total_parent_comments: number;
}

export interface BlogStructureType {
  blog_id?: string;
  title?: string;
  banner?: string;
  content?: OutputData;
  tags?: string[];
  des?: string;
  draft?: boolean;
  author?: {
    personal_info: AuthorStructureType;
  };
  activity?: ActivityStructureType;
  publishedAt?: string;
}

export interface GenerateBlogStructureType {
  page: number;
  results: BlogStructureType[];
  totalDocs: number;
}

export interface FormatBlogDataProps {
  create_new_arr?: boolean;
  prevArr: GenerateBlogStructureType | BlogStructureType[] | null;
  fetchData: BlogStructureType[] | null;
  page: number;
  countRoute: string;
  data_to_send?: object;
}
