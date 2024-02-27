/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import type mongoose from 'mongoose';

import UserSchema, { UserSchemaType } from '../schemas/user.schema';

// genarate username when user is exist in database
export const genarateUsername = async (email: string) => {
  const username = email.split('@')[0];
  const isUsernameExist = await UserSchema.exists({ 'personal_info.username': username }).then((result) => result);

  const newUsername = isUsernameExist ? `${username}-${uuidv4()}` : username;

  return newUsername;
};

export interface UserRequestType extends UserSchemaType {
  _id: mongoose.Types.ObjectId;
}

// format user data to send to client
export const formatDatatoSend = (user: UserRequestType & { userId: string }) => {
  console.log(user);

  // access_token 用來驗證使用者身份
  const access_token = jwt.sign({ userId: user._id }, process.env.SECRET_ACCESS_KEY as string, {
    expiresIn: 1000 * 60 * 60,
  });

  return {
    access_token,
    profile_img: user.personal_info?.profile_img,
    username: user.personal_info?.username,
    fullname: user.personal_info?.fullname,
  };
};
