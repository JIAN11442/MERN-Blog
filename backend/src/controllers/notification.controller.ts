/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import BlogSchema from '../schemas/blog.schema';
import NotificationSchema from '../schemas/notification.schema';

export const getLikeStatusByUserId: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { blogObjectID } = req.body;

    // 如果沒有 blogObjectID，就回傳錯誤
    if (!blogObjectID) {
      throw createHttpError('Please provide blog objectId from client');
    }

    // 檢查登入用戶是否曾經按贊了博客
    const isLikedExistByUserId = await NotificationSchema.exists({ type: 'like', user: userId, blog: blogObjectID });

    // 如果查詢失敗，會返回 null，所以這裏要轉換成 boolean，讓 null 變成 false
    res.status(200).json({ result: Boolean(isLikedExistByUserId) });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateTotalLikesByUserId: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { blogObjectID, isLikedByUser } = req.body;

    // 如果沒有 blogObjectID，就回傳錯誤
    if (!blogObjectID) {
      throw createHttpError('Please provide blog objectId from client');
    }

    // 如果沒有 isLikedByUser，就回傳錯誤
    if (isLikedByUser === null || isLikedByUser === undefined) {
      throw createHttpError('Please provide like state from client');
    }

    //  如果 isLikedByUser 是 true，就增加 1，反之，就減少 1
    const incrementVal = isLikedByUser ? 1 : -1;

    // 更新 blog 的 total_likes
    const updateTotalLikesOfBlog = await BlogSchema.findOneAndUpdate(
      { _id: blogObjectID },
      { $inc: { 'activity.total_likes': incrementVal } },
    );

    // 如果更新失敗，就回傳錯誤
    if (!updateTotalLikesOfBlog) {
      throw createHttpError('Failed to update total likes of blog');
    }

    // 反之，根據 isLikedByUser 的值，決定是要創建還是刪除通知
    if (isLikedByUser) {
      // 如果 isLikedByUser 是 true，就創建通知
      const newNotification = await NotificationSchema.create({
        type: 'like',
        blog: blogObjectID,
        notification_for: updateTotalLikesOfBlog.author,
        user: userId,
      });

      if (!newNotification) {
        throw createHttpError('Failed to create new notification');
      }

      res.status(200).json({ message: 'successfully liked the blog.' });
    } else {
      // 如果 isLikedByUser 是 false，則刪除通知
      const deleteNotification = await NotificationSchema.findOneAndDelete({
        type: 'like',
        blog: blogObjectID,
        user: userId,
      });

      if (!deleteNotification) {
        throw createHttpError('Failed to delete notification');
      }

      res.status(200).json({ message: 'already unliked the blog.' });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
