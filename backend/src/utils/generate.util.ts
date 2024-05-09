/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid/non-secure';
import aws from 'aws-sdk';

import UserSchema from '../schemas/user.schema';

import type { UserRequestType } from './types.util';
import env from './validateEnv.util';

// genarate username when user is exist in database
export const genarateUsername = async (email: string) => {
  const username = email.split('@')[0];
  const isUsernameExist = await UserSchema.exists({ 'personal_info.username': username }).then((result) => result);

  const newUsername = isUsernameExist ? `${username}-${nanoid(5)}` : username;

  return newUsername;
};

// format user data to send to client
export const formatDatatoSend = (user: UserRequestType) => {
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

// generate upload url for s3
const s3 = new aws.S3({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

export const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  const params = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: imageName,
    Expires: 1000, // 1 分鐘
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

  return uploadUrl;
};

export const generateBlogID = (title: string) => {
  const blogId = `${title
    .trim()
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .replace(/\s+/g, '-')}-${nanoid()}`;

  return blogId;
};

export const generateTagsWithLimitNum = (tags: string[], limitNum: number) => {
  // 隨機排序 tags，然後取得前 limitNum 個 tags
  // Array.prototype.sort() 可以接受一個比較函數，比較函數會接受兩個參數(姑且稱為 a 和 b)
  // 當比較函數的返回值為負數(即小於0)時，a 會被排列到 b 之前；反之，當比較函數的返回值為正數(即大於0)時，a 會被排列到 b 之後

  // 至於為什麼要用 0.5 - Math.random()，而不是 0.1 - Math.random()
  // 原因是因為 0.5 - Math.random() 會得到一個介於 -0.5 到 0.5 之間的數字
  // 這樣可以讓每一個 a 和 b 都有大約一半的概率可以換位

  // 而 a.length - b.length 則是根據 tag 的長度排序(一樣是按正負排列)
  // 比如有一個數組，[a, b]，假設 a 比 b 長
  // 則 a.length - b.length 會返回正數，a 會被排列到 b 之後 =》 [b, a]
  const randomLimitTags = tags
    .sort(() => 0.5 - Math.random())
    .slice(0, limitNum)
    .sort((a, b) => a.length - b.length);
  return randomLimitTags;
};
