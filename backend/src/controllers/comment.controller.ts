/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import CommentSchema from '../schemas/comment.schema';
import BlogSchema from '../schemas/blog.schema';
import NotificationSchema from '../schemas/notification.schema';

import env from '../utils/validateEnv.util';
import { CommentSchemaType } from '../utils/types.util';

interface NewCommentType extends CommentSchemaType {
  _id: string;
  commentedAt: Date;
}

const commentMaxLimit = env.GET_COMMENTS_LIMIT;

// 取得目標 blog 的所有未回復的留言
export const getCommentsByBlogId: RequestHandler = async (req, res, next) => {
  try {
    const { blogObjectId, skip } = req.body;

    const comments = await CommentSchema.find({ blog_id: blogObjectId, isReply: false })
      .populate('commented_by', 'personal_info.username personal_info.fullname personal_info.profile_img')
      .skip(skip)
      .limit(commentMaxLimit)
      .sort({ commentedAt: 1 });

    if (!comments) {
      throw createHttpError(404, 'No comments found in this blog');
    }

    res.status(200).json({ comments: comments });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 創建新的留言(頭留言或回覆留言)
export const createNewComment: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;

    const { blogObjectId, comment: reqComment, blog_author, replying_to } = req.body;

    if (!blogObjectId) {
      throw createHttpError(400, 'Please provide blog objectId from client');
    }

    if (!blog_author) {
      throw createHttpError(400, 'Please provide blog author id from client');
    }
    if (!reqComment.length) {
      throw createHttpError(400, 'Write something to leave a comment');
    }

    // 如果是回覆留言，replying_to 會有回覆目標留言的 objectId
    // 如果是頭留言，replying_to 會是 undefined
    const commentObj = {
      blog_id: blogObjectId,
      blog_author,
      comment: reqComment,
      commented_by: userId,
      isReply: Boolean(replying_to),
      parent: replying_to || undefined,
    };

    // 創建新的留言(不管是頭留言還是回覆留言)
    const newComment = await CommentSchema.create(commentObj);

    if (!newComment) {
      throw createHttpError(500, 'Failed to create new comment');
    }

    const { comment, commentedAt, children } = newComment as unknown as NewCommentType;

    // 同時更新 blog 的 comments 及 activity 資料
    // 如果是回覆留言，不會增加 total_parent_comments
    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: blogObjectId },
      {
        $push: { comments: newComment._id },
        $inc: { 'activity.total_comments': 1, 'activity.total_parent_comments': replying_to ? 0 : 1 },
      },
    );

    if (!updateBlogInfo) {
      throw createHttpError(500, 'Failed to update blog comments info and activity info');
    }

    // 當然每當有新留言，就要創建新的通知
    // 如果是回覆留言，type 就是 'reply'，反之就是 'comment'
    // 如果是回覆留言，replied_on_comment 就是被回覆留言的 objectId，反之就是 undefined
    const notificationObj = {
      type: replying_to ? 'reply' : 'comment',
      blog: blogObjectId,
      notification_for: blog_author,
      user: userId,
      comment: newComment._id,
      replied_on_comment: replying_to || undefined,
    };

    // 當新增了回覆留言，且 blog 及 notification 都更新成功後，
    // 就需要將新的回覆留言的 objectId 加入到被回覆留言的 children 中
    if (replying_to) {
      const updateRepliedComment = await CommentSchema.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: newComment._id } },
      );

      if (!updateRepliedComment) {
        throw createHttpError(500, 'Failed to update replied comment children');
      }

      // 雖然前面的 notificationObj 設定過了 notification_for，但那是適用於頭留言
      // 如果是回覆留言，要通知的對象不應該是 blog 的作者，而是被回覆留言的作者，也就是被回覆留言的 commented_by
      // 所以當更新被回覆留言的 children 成功後，記得要順便以更新後的被回覆留言的 commented_by 來更新 notification_for
      notificationObj.notification_for = updateRepliedComment?.commented_by;
    }

    // 最後創建新的通知
    const newCommentNotification = await NotificationSchema.create(notificationObj);

    if (!newCommentNotification) {
      throw createHttpError(500, 'Failed to create new comment notification');
    }

    res.status(200).json({ comment, commentedAt, _id: newComment._id, children });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 載入回覆留言
export const loadRepliesByCommentId: RequestHandler = async (req, res, next) => {
  try {
    const { repliedCommentId, skip } = req.body;

    if (!repliedCommentId) {
      throw createHttpError(400, 'Please provide replied comment id from client');
    }

    if (skip === undefined) {
      throw createHttpError(400, 'Please provide skip value from client');
    }

    // 取得被回覆留言下的 maxLimit 筆回覆留言
    // 並且 populate 其中的 children，以及 children 中的 commented_by
    // 因為是雙重 populate(第一層是被回覆留言下的 children id；第二層是第一層 populate 後 children 中的 commented_by id)
    // 所以這裡會用進階的 populate 寫法
    const repliesComment = await CommentSchema.findOne({ _id: repliedCommentId })
      .populate({
        path: 'children',
        options: { limit: commentMaxLimit, skip: skip, sort: { commentedAt: 1 } },
        populate: {
          path: 'commented_by',
          select: 'personal_info.fullname personal_info.username personal_info.profile_img',
        },
        select: '-updatedAt',
      })
      .select('children -_id');

    if (!repliesComment?.children.length) {
      throw createHttpError(404, 'No replies found in this comment');
    }

    res.status(200).json({ repliesComment: repliesComment.children });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 刪除頭留言
export const deleteCommentById: RequestHandler = async (req, res, next) => {
  try {
    const { commentObjectId, blogObjectId } = req.body;

    if (!commentObjectId) {
      throw createHttpError(400, 'Please provide comment id from client');
    }

    if (!blogObjectId) {
      throw createHttpError(400, 'Please provide blog id from client');
    }

    const commentExistInBlog = await BlogSchema.findOne({ _id: blogObjectId, comments: commentObjectId });

    if (!commentExistInBlog) {
      throw createHttpError(404, 'Comment not found in this blog');
    }

    const deleteComment = await CommentSchema.findByIdAndDelete(commentObjectId);

    if (!deleteComment) {
      throw createHttpError(500, 'Failed to delete comment');
    }

    const deleteNotification = await NotificationSchema.findOneAndDelete({ type: 'comment', comment: commentObjectId });

    if (!deleteNotification) {
      throw createHttpError(500, 'Failed to delete comment notification');
    }

    const descrementVal = -1;

    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: blogObjectId },
      {
        $inc: { 'activity.total_comments': descrementVal, 'activity.total_parent_comments': descrementVal },
        $pull: { comments: commentObjectId },
      },
    );

    if (!updateBlogInfo) {
      throw createHttpError(500, 'Failed to update blog comments info and activity info');
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
