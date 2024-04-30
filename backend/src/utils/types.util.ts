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

export interface PersonalInfoStructureType {
  fullname?: string;
  email?: string;
  password?: string;
  username?: string;
  bio?: string;
  profile_img?: string;
}

export interface AuthorStructureType {
  personal_info: PersonalInfoStructureType;
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
    personal_info: PersonalInfoStructureType;
  };
  activity?: ActivityStructureType;
  publishedAt?: string;
}

export interface GenerateStructureType {
  page: number;
  results: BlogStructureType[] | PersonalInfoStructureType[];
  totalDocs: number;
  prevLoadNum: number[];
}

export interface FormatBlogDataProps {
  create_new_arr?: boolean;
  prevArr: GenerateStructureType | BlogStructureType[] | PersonalInfoStructureType[] | null;
  fetchData: BlogStructureType[] | null;
  page: number;
  countRoute: string;
  fetchRoute?: string;
  data_to_send?: object;
  state?: string;
}

export interface FetchBlogsPropsType {
  category?: string;
  query?: string;
  page?: number;
  create_new_arr?: boolean;
  state?: string;
}

export interface FunctionPropsType {
  category?: string;
  query?: string;
  page?: number;
  state?: string;
}
