import type mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import type { OutputData } from '@editorjs/editorjs';

import { userSchema } from '../schemas/user.schema';
import { blogSchema } from '../schemas/blog.schema';
import { notificationSchema } from '../schemas/notification.schema';
import { commentSchema } from '../schemas/comment.schema';

export type UserSchemaType = InferSchemaType<typeof userSchema>;
export type BlogSchemaType = InferSchemaType<typeof blogSchema>;
export type NotificationSchemaType = InferSchemaType<typeof notificationSchema>;
export type CommentSchemaType = InferSchemaType<typeof commentSchema>;

export interface SignUpReqBody {
  fullname: string;
  email: string;
  password: string;
}

export interface SignInReqBody {
  email: string;
  password: string;
}

export interface UserRequestType extends UserSchemaType {
  _id: mongoose.Types.ObjectId;
}

export interface BlogReqBody {
  banner?: string;
  title?: string;
  content?: OutputData;
  tags?: string[];
  des?: string;
  draft?: boolean;
}

export interface ChangePasswordReqBody {
  currPassword: string;
  newPassword: string;
}
