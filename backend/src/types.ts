import type mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { userSchema } from './schemas/user.schema';

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
