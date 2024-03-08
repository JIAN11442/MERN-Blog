/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid/non-secure';

import UserSchema from '../schemas/user.schema';
import type { UserRequestType } from '../types';

// genarate username when user is exist in database
export const genarateUsername = async (email: string) => {
  const username = email.split('@')[0];
  const isUsernameExist = await UserSchema.exists({ 'personal_info.username': username }).then((result) => result);

  const newUsername = isUsernameExist ? `${username}-${nanoid(5)}` : username;

  return newUsername;
};

// format user data to send to client
export const formatDatatoSend = (user: UserRequestType & { userId: string }) => {
  try {
    // access_token 用來驗證使用者身份
    const access_token = jwt.sign({ userId: user._id }, process.env.SECRET_ACCESS_KEY as string, {
      expiresIn: 1000 * 60 * 10, // 10 分鐘
    });

    return {
      access_token,
      profile_img: user.personal_info?.profile_img,
      username: user.personal_info?.username,
      fullname: user.personal_info?.fullname,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
