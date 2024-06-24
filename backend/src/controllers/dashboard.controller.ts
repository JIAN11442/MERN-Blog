/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

import env from '../utils/validateEnv.util';

import NotificationSchema from '../schemas/notification.schema';
import { NotificationQueryProps } from '../utils/types.util';

// 根據 userId 取得通知情況，
// 並格式化成前端需要的格式
export const getNotificationsByUserId: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const objectUserId = new Types.ObjectId(userId);

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const notificationInfo = await NotificationSchema.aggregate([
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

    return res.status(200).json({ notification: notificationInfo[0] });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 根據 Filter 來取得通知
export const getNotificationsByFilter: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { page, filter, deleteDocCount } = req.body;

    const maxLimit = env.NOTIFICATION_LOAD_LIMIT;
    let skipDocs = (page - 1) * maxLimit;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    if (!filter) {
      throw createHttpError(400, 'Please provide a filter type from client side');
    }

    const findQuery = {
      notification_for: userId,
      user: { $ne: userId },
      seen: false,
    } as unknown as NotificationQueryProps;

    // 如果 filter 是 all, 就不需要額外加上 type 來篩選資料
    // 如果 filter 不是 all, 就需要加上 type 來篩選資料
    if (filter !== 'all') {
      findQuery.type = filter;
    }

    // ??
    if (deleteDocCount) {
      skipDocs -= deleteDocCount;
    }

    const notificationsInfo = await NotificationSchema.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate('blog', 'title blog_id')
      .populate('user', 'personal_info.fullname personal_info.username personal_info.profile_img')
      .populate('comment', 'comment')
      .populate('replied_on_comment', 'comment')
      .sort({ createdAt: -1 })
      .select('createdAt type seen reply');

    if (!notificationsInfo) {
      throw createHttpError(500, 'No notifications found with this filter');
    }

    res.status(200).json({ notification: notificationsInfo });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 根據 Filter 來取得通知的數量
export const getCountOfNotificationsByFilter: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { filter } = req.body;

    console.log(userId, filter);

    if (!filter) {
      throw createHttpError(400, 'Please provide a filter type from client side');
    }

    const findQuery = {
      notification_for: userId,
      user: { $ne: userId },
      seen: false,
    } as unknown as NotificationQueryProps;

    if (filter !== 'all') {
      findQuery.type = filter;
    }

    const notificationCount = await NotificationSchema.countDocuments(findQuery);

    res.status(200).json({ totalDocs: notificationCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
