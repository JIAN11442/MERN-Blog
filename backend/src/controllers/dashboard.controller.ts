/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

import NotificationSchema from '../schemas/notification.schema';
import BlogSchema from '../schemas/blog.schema';
import CommentSchema from '../schemas/comment.schema';
import UserSchema from '../schemas/user.schema';

import env from '../utils/validateEnv.util';
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
          removed: false,
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
      removed: false,
    } as unknown as NotificationQueryProps;

    // 如果 filter 是 all, 就不需要額外加上 type 來篩選資料
    // 如果 filter 不是 all, 就需要加上 type 來篩選資料
    if (filter !== 'all') {
      findQuery.type = filter;
    }

    if (deleteDocCount) {
      skipDocs -= deleteDocCount;
    }

    const notificationsInfo = await NotificationSchema.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate('blog', 'title blog_id author')
      .populate('user', 'personal_info.fullname personal_info.username personal_info.profile_img')
      .populate('comment', 'comment')
      .populate('reply', 'comment children')
      .populate('replied_on_comment', '_id comment commentedAt')
      .sort({ createdAt: -1 })
      .select('createdAt type seen reply removed');

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

    if (!filter) {
      throw createHttpError(400, 'Please provide a filter type from client side');
    }

    const findQuery = {
      notification_for: userId,
      user: { $ne: userId },
      removed: false,
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

// 根據 notificationId 移除通知
export const removeNotificationById: RequestHandler = async (req, res, next) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      throw createHttpError(400, 'Please provide a notification id');
    }

    const updateNotification = await NotificationSchema.findByIdAndUpdate(
      { _id: notificationId },
      { removed: true },
      { new: true },
    );

    if (!updateNotification) {
      throw createHttpError(500, 'Failed to remove notification');
    }

    res.status(200).json({ message: 'Notification removed successfully', notification: updateNotification });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 根據 userId 更新其下通知的已讀狀態
export const updateRelateNotificationSeenStateByUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { seen } = req.body;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    if (seen === undefined) {
      throw createHttpError(400, 'Please provide a seen state');
    }

    const findQuery = {
      notification_for: userId,
      user: { $ne: userId },
      removed: false,
    } as unknown as NotificationQueryProps;

    const updateNotificationSeen = await NotificationSchema.updateMany(findQuery, { seen: seen });

    if (!updateNotificationSeen) {
      throw createHttpError(500, 'Failed to mark all notifications as unseen');
    }

    res.status(200).json({ message: 'notifications is marked ' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 根據 notificationId 更新通知已讀狀態
export const updateNotificationSeenStateById: RequestHandler = async (req, res, next) => {
  try {
    const { seen, notificationId } = req.body;

    if (seen === undefined) {
      throw createHttpError(400, 'Please provide a seen state');
    }

    if (!notificationId) {
      throw createHttpError(400, 'Please provide a notification id');
    }

    const notificationIdSeenState = await NotificationSchema.findById({ _id: notificationId }).select('seen');

    if (notificationIdSeenState?.seen) {
      return res.status(200).json({ message: 'Notification already marked ' });
    }

    const updateNotificationSeen = await NotificationSchema.findOneAndUpdate({ _id: notificationId }, { seen: seen });

    if (!updateNotificationSeen) {
      throw createHttpError(500, 'Failed to mark all notifications as unseen');
    }

    res.status(200).json({ message: 'All notifications already marked ' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得用戶的 blogs 資料
export const getUserWrittenBlogs: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { page, draft, query, deleteDocCount } = req.body;
    const maxLimit = env.GET_USER_BLOGS_LIMIT;
    let skipDocs = (page - 1) * maxLimit;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    if (page === undefined || page < 1) {
      throw createHttpError(400, 'Please provide a page number from 1');
    }

    if (draft === undefined) {
      throw createHttpError(400, 'Please provide a draft state');
    }

    if (deleteDocCount) {
      skipDocs -= deleteDocCount;
    }

    const getBlogs = await BlogSchema.find({ author: userId, draft, title: new RegExp(query, 'i') })
      .limit(maxLimit)
      .skip(skipDocs)
      .select('_id blog_id title banner des draft activity publishedAt')
      .sort({ publishedAt: -1 });

    if (!getBlogs) {
      throw createHttpError(500, 'No blogs found with this filter');
    }

    res.status(200).json({ blogs: getBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得用戶的 blogs 數量
export const getCountOfUserWrittenBlogs: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { draft, query } = req.body;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    if (draft === undefined) {
      throw createHttpError(400, 'Please provide a draft state');
    }

    if (query === undefined) {
      throw createHttpError(400, 'Please provide a query');
    }

    const blogsCount = await BlogSchema.countDocuments({ author: userId, draft, title: new RegExp(query, 'i') });

    res.status(200).json({ totalDocs: blogsCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 刪除目標 blog
export const deleteBlogById: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { blogObjId } = req.body;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    if (!blogObjId) {
      throw createHttpError(400, 'Please provide a blog id');
    }

    // 先確認目標 blog 是否存在
    // 因為之後會用到 blog 中的 total_reads 數據
    const targetBlog = await BlogSchema.findById({ _id: blogObjId });

    if (!targetBlog) {
      throw createHttpError(404, 'Blog not found');
    }

    // 刪除與該 blog 有關的所有通知
    const deleteRelateNotification = await NotificationSchema.deleteMany({ blog: blogObjId });

    if (!deleteRelateNotification) {
      throw createHttpError(500, 'Failed to delete relate notification');
    }

    // 刪除與該 blog 有關的所有留言
    const deleteRelateComment = await CommentSchema.deleteMany({ blog_id: blogObjId, blog_author: userId });

    if (!deleteRelateComment) {
      throw createHttpError(500, 'Failed to delete relate comment');
    }

    const incrementVal = targetBlog.draft ? 0 : -1;

    // 刪除記錄在用戶 schema 中 blog list 中的目標 blogId
    const updateUserSchema = await UserSchema.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: { blogs: blogObjId },
        $inc: {
          'account_info.total_posts': incrementVal,
          'account_info.total_reads': incrementVal * (targetBlog.activity?.total_reads ?? 0),
        },
      },
    );

    if (!updateUserSchema) {
      throw createHttpError(500, 'Failed to delete relate user schema');
    }

    // 最後刪除目標 blog
    const deleteTargetBlog = await BlogSchema.findByIdAndDelete({ _id: blogObjId });

    if (!deleteTargetBlog) {
      throw createHttpError(500, 'Failed to delete target blog');
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
