import type mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import type { OutputData } from '@editorjs/editorjs';
import { userSchema } from '../schemas/user.schema';

export interface SignUpBody {
  fullname: string;
  email: string;
  password: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export type UserSchemaType = InferSchemaType<typeof userSchema>;

export interface GenarateDataType {
  access_token: string;
  profile_img: string;
  username: string;
  fullname: string;
}

export interface UserRequestType extends UserSchemaType {
  _id: mongoose.Types.ObjectId;
}

export interface BlogStructureType {
  title?: string;
  banner?: string;
  content?: OutputData;
  tags?: string[];
  des?: string;
  author?: {
    personal_info: {
      fullname?: string;
      email?: string;
      password?: string;
      username?: string;
      bio?: string;
      personal_img?: string;
    };
  };
}
