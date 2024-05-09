import type mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import type { OutputData } from '@editorjs/editorjs';

import { userSchema } from '../schemas/user.schema';
import { blogSchema } from '../schemas/blog.schema';
import { notificationSchema } from '../schemas/notification.schema';

export type UserSchemaType = InferSchemaType<typeof userSchema>;
export type BlogSchemaType = InferSchemaType<typeof blogSchema>;
export type NotificationSchemaType = InferSchemaType<typeof notificationSchema>;

export interface SignUpBody {
  fullname: string;
  email: string;
  password: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export interface GenerateAuthDataType {
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
  _id?: string;
  blog_id?: string;
  title?: string;
  banner?: string;
  content?: OutputData;
  tags?: string[];
  des?: string;
  draft?: boolean;
  author?: { personal_info: PersonalInfoStructureType };
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
  categories?: string[];
  query?: string;
  authorId?: string;
  page?: number;
  create_new_arr?: boolean;
  state?: string;
  limit?: number;
  eliminate_blogId?: string;
  blogId?: string;
  draft?: boolean;
  mode?: string;
}

export interface FunctionPropsType {
  category?: string;
  query?: string;
  authorId?: string;
  page?: number;
  state?: string;
}

export interface AuthorProfileStructureType {
  _id: string;
  personal_info: {
    fullname: string;
    email?: string;
    username: string;
    profile_img: string;
    bio: string;
  };
  account_info: {
    total_posts: number;
    total_reads: number;
  };
  social_links: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  createdAt: string;
}

export interface ScrollPropsType {
  visible: boolean;
  position: number;
}
