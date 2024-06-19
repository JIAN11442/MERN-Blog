/* eslint-disable prefer-destructuring */
/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import UserSchema from '../schemas/user.schema';

import env from '../utils/validateEnv.util';
import { ValidateChangePassword } from '../utils/validateController.util';

const BioMaxLength = env.BIO_CHAR_LIMIT;

// 修改用戶密碼
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { currPassword, newPassword } = req.body;

    const validateResult = ValidateChangePassword(req.body);

    // 檢查是否有登入，即是否有 userId
    // 因爲後面要根據 userId 找到使用者
    if (!userId) {
      throw createHttpError(401, 'Please Login First');
    }

    // 檢查密碼是否符合規則
    if (validateResult !== true) {
      throw createHttpError(validateResult.statusCode, validateResult.message);
    }

    // 找到目標使用者
    const user = await UserSchema.findById(userId);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    // 如果是透過 Google 登入的使用者，不允許更改密碼
    if (user.google_auth) {
      throw createHttpError(403, "You can't change account's password because you logged in through Google account");
    }

    // 接著，檢查提供的舊密碼是否正確
    const isPasswordValid = await bcrypt.compare(currPassword, user.personal_info?.password ?? '');

    // 如果舊密碼不正確，則拋出錯誤
    if (!isPasswordValid) {
      throw createHttpError(403, 'Incorrect  current password');
    }

    // 如果正確，加密新密碼
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 如果加密失敗，拋出錯誤
    if (!hashedNewPassword) {
      throw createHttpError(500, 'Failed to hash new password');
    }

    // 如果上述檢查都沒問題，那可以更新密碼了
    const updatePassword = await UserSchema.findOneAndUpdate(
      { _id: userId },
      { 'personal_info.password': hashedNewPassword },
    );

    // 如果更新失敗，拋出錯誤
    if (!updatePassword) {
      throw createHttpError(500, 'Failed to update password');
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 修改用戶頭像照片
export const updateUserAvatar: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { imgUrl } = req.body;

    if (!imgUrl) {
      throw createHttpError(400, 'Please provide a image url');
    }
    const updateUserProfileImg = await UserSchema.findOneAndUpdate(
      { _id: userId },
      { 'personal_info.profile_img': imgUrl },
    );

    if (!updateUserProfileImg) {
      throw createHttpError(500, 'Failed to update user profile image');
    }

    res.status(200).json({ message: 'User profile image updated successfully', imgUrl });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 修改用戶資料
export const updateUserProfile: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { username: reqUsername, bio: reqBio, social_links: reqSocial_links } = req.body;

    // 如果 username 長度小於 3，拋出錯誤
    if (reqUsername.length < 3) {
      throw createHttpError(403, 'Username must be at least 3 letters long');
    }

    // 如果 bio 長度大於 BIO_CHAR_LIMIT，拋出錯誤
    if (reqBio.length > BioMaxLength) {
      throw createHttpError(403, `Bio should not exceed ${BioMaxLength} characters`);
    }

    if (!reqSocial_links) {
      throw createHttpError(403, 'Please provide social links');
    }

    // 檢查 social_links 的格式
    let socialLinksChecked = true;
    const socialLinksArr = Object.keys(reqSocial_links);

    try {
      for (let i = 0; i < socialLinksArr.length; i++) {
        if (reqSocial_links[socialLinksArr[i]].length) {
          // 檢查是否有 http(s)://
          // 從完整的 URL，即 social_links[socialLinksArr[i]] 中提取出域名或子域名作檢查
          // 比如，從 https://www.facebook.com/username 中提取出 www.facebook.com
          // 如果提取過程中出錯，那可能是沒有提供完整的 URL，比如沒有 http(s)://
          // 這樣的話，就拋出錯誤
          const hostname = new URL(reqSocial_links[socialLinksArr[i]]).hostname;

          // 如果沒問題，那就檢查是否是合法的域名
          // 檢查的方法也很簡單，就是看提取出來的域名中是否包含目標網站的域名
          // 比如，www.facebook.com 中是否包含 facebook.com
          if (!hostname.includes(`${[socialLinksArr[i]]}.com`) && socialLinksArr[i] !== 'website') {
            throw createHttpError(403, `${socialLinksArr[i]} link is invalid. You must enter a correct full link`);
          }
        }
      }
    } catch (error) {
      // 如果檢查過程中出錯，那就將 socialLinksChecked 設為 false
      // 這樣就不會接著更新用戶資料的步驟，相當於 return 效果
      socialLinksChecked = false;

      // 打印錯誤，並傳遞錯誤到下一個 middleware
      console.log(error);
      next(error);
    }

    // 如果上述檢查都沒問題，即 socialLinksChecked 為 true
    // 那就可以更新用戶資料了
    if (socialLinksChecked) {
      const updateObj = {
        'personal_info.username': reqUsername,
        'personal_info.bio': reqBio,
        social_links: reqSocial_links,
      };

      // runValidators: true 會在更新時檢查是否符合 schema 規則
      // 因為我們的 user schema 中的 username 有設定必須是 unique 的，所以最好在更新時檢查一下
      // 如果 username 重複，那會拋出 error.code === 11000 的'重複'錯誤，接著到 catch 中執行
      // 而我們已經事先在 errors.util.ts 中處理了這個錯誤，所以可以直接 next(error)
      // new: true 會返回更新後的 document
      const updatedTargetProfile = await UserSchema.findOneAndUpdate({ _id: userId }, updateObj, {
        runValidators: true,
        new: true,
      });

      if (!updatedTargetProfile) {
        throw createHttpError(500, 'Failed to update user profile');
      }

      const { personal_info, social_links } = updatedTargetProfile;

      res.status(200).json({
        message: 'User profile updated successfully',
        result: { username: personal_info?.username, bio: personal_info?.bio, social_links },
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
