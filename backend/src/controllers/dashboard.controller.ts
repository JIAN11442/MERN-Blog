/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import NotificationSchema from '../schemas/notification.schema';

// 取得通知情況
export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    // 找出所有 notification_for 為當前使用者，且未讀的通知
    // 另外，如果是當前使用者自己發出的通知，則不會被列入($ne: 不等於的意思)
    const getNotificationsByUserId = await NotificationSchema.find({
      notification_for: userId,
      seen: false,
      user: { $ne: userId },
    }).select('_id');

    return res.status(200).json({ notification: getNotificationsByUserId });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
