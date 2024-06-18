/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import UserSchema from '../schemas/user.schema';

import { ValidateChangePassword } from '../utils/validateController.util';

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
  const { userId } = req;
  const { imgUrl } = req.body;

  console.log(imgUrl);

  try {
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
