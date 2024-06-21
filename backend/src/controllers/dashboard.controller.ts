/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

import NotificationSchema from '../schemas/notification.schema';

// 取得通知情況
export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const objectUserId = new Types.ObjectId(userId);

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    // 找出所有 notification_for 為當前使用者，且未讀的通知
    // 另外，如果是當前使用者自己發出的通知，則不會被列入($ne: 不等於的意思)

    // const getNotificationsByUserId = await NotificationSchema.find({
    //   notification_for: userId,
    //   seen: false,
    //   user: { $ne: userId },
    // }).select('_id type');

    const getNotificationsByUserId = await NotificationSchema.aggregate([
      {
        // $match 用來過濾資料，只保留符合條件的資料
        $match: {
          notification_for: objectUserId,
          seen: false,
          user: { $ne: objectUserId },
        },
      },
      {
        // $group 用來將資料分組，並計算每組的數量
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      {
        // $facet 用來將資料分成多個部分
        // 這裡的 $facet 會有兩個部分，一個是 totalCount，一個是 countByType
        // 有個需要注意到點是，它會根據上一步 $group 的結果進行計算，因此...
        $facet: {
          // totalCount 是將上一步 $group 的結果再一次 $group 進行總和
          // 注意這裡的 _id: null 與下面通過 $project 格式化而設定的 _id: 0 是不同的概念
          // 前者是為了 $group ，所以無法不設定 _id，只能設定為 null；後者則是為了 $project 格式化，選擇不輸出上一步 $group 結果中的 _id
          totalCount: [{ $group: { _id: null, total: { $sum: '$count' } } }],

          // 而 countByType 則是將上一步 $group 的結果進行格式化
          // 注意這時候的 _id: 0 代表輸出不需要 _id，其他的 '$_id' 與 '$count' 只是引用上一步 $group 結果中的對應資料
          countByType: [{ $project: { _id: 0, type: '$_id', count: '$count' } }],
        },
      },
      {
        // $addFields 用來新增欄位，這裡是將上一步 $facet 的結果中的 totalCount 進行格式轉換
        // 我希望 totalCount 直接指向 total 的值，而不是在一個 array 中
        // 所以透過 $arrayElemAt 來取得上一步 $facet 結果中的第一個值中的 totalCount 中的 total
        $addFields: {
          totalCount: { $arrayElemAt: ['$totalCount.total', 0] },
        },
      },
    ]);

    return res.status(200).json({ notification: getNotificationsByUserId[0] });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
