/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import UserSchema from '../schemas/user.schema';
import NotificationSchema from '../schemas/notification.schema';

import env from '../utils/validateEnv.util';

const getRelatedUserLimit = env.GET_RELATED_USERS_LIMIT;

// 取得 username 包含 query 的使用者
export const getRelatedUsersByQuery: RequestHandler = async (req, res, next) => {
  try {
    const { query, page } = req.body;

    if (!query) {
      throw createHttpError(400, 'Please provide a query from client.');
    }

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    const users = await UserSchema.find({ 'personal_info.username': new RegExp(query, 'i') })
      .skip((page - 1) * getRelatedUserLimit)
      .limit(getRelatedUserLimit)
      .select('personal_info.fullname personal_info.username personal_info.profile_img -_id');

    if (!users) throw createHttpError(500, 'No users found with this query.');

    res.status(200).json({ queryUsers: users });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得所有 username 包含 query 的使用者數量
export const getRelatedUsersByQueryCount: RequestHandler = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      throw createHttpError(400, 'Please provide a query from client.');
    }

    const queryUsersCount = await UserSchema.countDocuments({ 'personal_info.username': new RegExp(query, 'i') });

    res.status(200).json({ totalDocs: queryUsersCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得目標作者的使用者資訊
export const getAuthorProfileInfo: RequestHandler = async (req, res, next) => {
  try {
    const { authorUsername } = req.body;

    if (!authorUsername) {
      throw createHttpError(400, 'Please provide a username from client.');
    }

    const matchAuthor = await UserSchema.findOne({ 'personal_info.username': authorUsername }).select(
      '-personal_info.password -google_auth -updatedAt -blogs',
    );

    if (!matchAuthor) {
      throw createHttpError(404, 'No author found with this username.');
    }

    res.status(200).json({ author: matchAuthor });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 查看該用戶是否已追蹤
export const checkUserIsFollowing: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { authorUsername } = req.body;

    if (!userId) {
      throw createHttpError(400, 'Please provide a userId from client.');
    }

    if (!authorUsername) {
      throw createHttpError(400, 'Please provide a profileObjId from client.');
    }

    const authorInfo = await UserSchema.findOne({ 'personal_info.username': authorUsername }).select('_id');

    if (!authorInfo) {
      throw createHttpError(404, 'No user found with this username.');
    }

    if (authorInfo._id === userId) {
      throw createHttpError(404, 'You cannot follow yourself.');
    }

    const isUserFollowing = await UserSchema.exists({ _id: userId, following: authorInfo._id });

    res.status(200).json({ isFollowing: Boolean(isUserFollowing) });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 追蹤目標作者
export const followAuthor: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { authorUsername } = req.body;

    // 檢查條件
    if (!userId) {
      throw createHttpError(400, 'Please provide a userId from client.');
    }

    if (!authorUsername) {
      throw createHttpError(400, 'Please provide a authorUsername from client.');
    }

    // 根據提供的 username 找到對應的作者 ID
    const authorInfo = await UserSchema.findOne({ 'personal_info.username': authorUsername }).select('_id');

    if (!authorInfo) {
      throw createHttpError(404, 'No user found with this username.');
    }

    // 如果提供的 username 是自己的話，則拋出錯誤
    // 因爲追蹤自己是沒意義的
    if (authorInfo._id === userId) {
      throw createHttpError(404, 'You cannot follow yourself.');
    }

    // 接著將當前作者添加到自己的 following 追蹤名單中
    const addAuthorIdToUserFollowingList = await UserSchema.findByIdAndUpdate(userId, {
      $push: { following: authorInfo._id },
      $inc: { 'account_info.total_following': 1 },
    });

    if (!addAuthorIdToUserFollowingList) {
      throw createHttpError(500, 'Failed to follow this author.');
    }

    // 最後將自己添加到作者的 followers 追蹤名單中
    const addUserIdToAuthorFollowersList = await UserSchema.findByIdAndUpdate(authorInfo._id, {
      $push: { followers: userId },
      $inc: { 'account_info.total_followers': 1 },
    });

    if (!addUserIdToAuthorFollowersList) {
      throw createHttpError(500, 'Failed to update author followers.');
    }

    // 不管是從通知頁面點擊追蹤按鈕，還是從作者頁面點擊追蹤按鈕
    // 都需要更新追踪對象產生的通知狀態的 follow 欄位
    // 這樣即使在其他地方 follow 對象，對應的通知也會被標記為已 follow
    const notificationQuery = {
      type: 'follow',
      user: authorInfo._id,
      notification_for: userId,
    };

    const parentNotification = await NotificationSchema.findOne(notificationQuery);

    if (parentNotification) {
      const updateParentNotification = await NotificationSchema.findOneAndUpdate(notificationQuery, {
        follow: authorInfo._id,
      });

      if (!updateParentNotification) {
        throw createHttpError(500, 'Failed to update parent notification status.');
      }
    }

    // 如果存在 parentNotification，代表對方已經追蹤過自己
    // 那麼這次追蹤行為產生的通知就不需要對方再次追蹤自己
    // 所以 follow 欄位就自動設置為對方的 ID
    const notificationObj = {
      type: 'follow',
      notification_for: authorInfo._id,
      user: userId,
      follow: parentNotification ? authorInfo._id : undefined,
    };

    // 新增 notification 通知對方
    const newNotification = await NotificationSchema.create(notificationObj);

    if (!newNotification) {
      throw createHttpError(500, 'Failed to create new notification.');
    }

    res.status(200).json({ message: 'Followed this author successfully.', authorId: authorInfo._id, userId });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 退追蹤目標作者
export const unfollowAuthor: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { authorUsername } = req.body;

    // 檢查條件
    if (!userId) {
      throw createHttpError(400, 'Please provide a userId from client.');
    }

    if (!authorUsername) {
      throw createHttpError(400, 'Please provide a authorUsername from client.');
    }

    // 根據提供的 username 找到對應的作者 ID
    const authorInfo = await UserSchema.findOne({ 'personal_info.username': authorUsername }).select('_id');

    if (!authorInfo) {
      throw createHttpError(404, 'No user found with this username.');
    }

    // 如果提供的 username 是自己的話，則拋出錯誤
    // 因爲退追蹤自己是沒意義的
    if (authorInfo._id === userId) {
      throw createHttpError(404, 'You cannot unfollow yourself.');
    }

    // 接著將當前作者從自己的 following 追蹤名單中刪除
    const deleteAuthorIdFromUserFollowingList = await UserSchema.findByIdAndUpdate(userId, {
      $pull: { following: authorInfo._id },
      $inc: { 'account_info.total_following': -1 },
    });

    if (!deleteAuthorIdFromUserFollowingList) {
      throw createHttpError(500, 'Failed to unfollow this author.');
    }

    // 最後將自己從作者的 followers 追蹤名單中刪除
    const deleteUserIdFromAuthorFollowersList = await UserSchema.findByIdAndUpdate(authorInfo._id, {
      $pull: { followers: userId },
      $inc: { 'account_info.total_followers': -1 },
    });

    if (!deleteUserIdFromAuthorFollowersList) {
      throw createHttpError(500, 'Failed to update author followers.');
    }

    const notificationQuery = {
      type: 'follow',
      user: authorInfo._id,
      notification_for: userId,
    };

    const parentNotification = await NotificationSchema.findOne(notificationQuery);

    if (parentNotification) {
      const updateParentNotification = await NotificationSchema.findOneAndUpdate(notificationQuery, {
        follow: undefined,
      });

      if (!updateParentNotification) {
        throw createHttpError(500, 'Failed to update parent notification status.');
      }
    }

    const deleteNotification = await NotificationSchema.findOneAndDelete({
      type: 'follow',
      notification_for: authorInfo._id,
      user: userId,
    });

    if (!deleteNotification) {
      throw createHttpError(500, 'Failed to delete notification.');
    }

    res.status(200).json({ message: 'Unfollowed this author successfully.', authorId: authorInfo._id });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
