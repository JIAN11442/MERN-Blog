import { OutputData } from '@editorjs/editorjs';

export interface GenerateAuthDataType {
  access_token: string;
  profile_img: string;
  username: string;
  fullname: string;
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
  total_likes?: number;
  total_comments?: number;
  total_reads?: number;
  total_parent_comments?: number;
}

export interface BlogStructureType {
  _id?: string;
  blog_id?: string;
  title?: string;
  banner?: string;
  des?: string;
  content?: OutputData;
  tags?: string[];
  author?: { _id?: string; personal_info: PersonalInfoStructureType };
  activity?: ActivityStructureType;
  comments?: { results: GenerateCommentStructureType[] };
  draft?: boolean;
  publishedAt?: string;
}

export interface GenerateToLoadStructureType {
  page: number;
  results: BlogStructureType[] | PersonalInfoStructureType[];
  totalDocs: number;
  prevLoadNum: number[];
}

export interface FormattedBlogDataProps {
  create_new_arr?: boolean;
  prevArr:
    | GenerateToLoadStructureType
    | BlogStructureType[]
    | PersonalInfoStructureType[]
    | null;
  fetchData: BlogStructureType[] | null;
  page: number;
  countRoute: string;
  fetchRoute?: string;
  data_to_send?: object;
  state?: string;
}

export interface FetchLoadPropsType {
  query?: string;
  page?: number;
  state?: string;
}

export interface FetchBlogsPropsType extends FetchLoadPropsType {
  category?: string;
  categories?: string[];
  authorId?: string;
  create_new_arr?: boolean;
  limit?: number;
  eliminate_blogId?: string;
  blogId?: string;
  draft?: boolean;
  mode?: string;
}

export interface LoadFunctionPropsType extends FetchLoadPropsType {
  category?: string;
  authorId?: string;
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

export interface CommentStructureType {
  blog_id?: string;
  blog_author?: string;
  comment?: string;
  children?: string[];
  commented_by?: { personal_info: PersonalInfoStructureType };
  isReply?: boolean;
  parent?: string;
}

export interface GenerateCommentStructureType extends CommentStructureType {
  _id?: string;
  childrenLevel: number;
  commentedAt?: string;
  updatedAt?: string;
}

export interface FetchCommentPropsType {
  blogObjectId?: string;
  commentObjectId?: string;
  skip?: number;
  commentArray?: GenerateCommentStructureType[] | null;
  comment?: string;
  blog_author?: string;
}
