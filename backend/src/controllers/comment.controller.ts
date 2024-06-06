/* eslint-disable eqeqeq */
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

    if (!userId) {
      throw createHttpError(401, 'Please login first');
    }

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

interface deleteFuncPropsType {
  commentObjectId: string;
  deleteNum: number;
}

// 刪除留言
const deleteCommentFunc = async ({ commentObjectId, deleteNum }: deleteFuncPropsType) => {
  let deleteCount = deleteNum;

  try {
    // 找到該留言
    const comment = await CommentSchema.findOne({ _id: commentObjectId });

    // 如果找不到該留言，自然就不能刪除，就回傳錯誤
    if (!comment) {
      throw createHttpError(404, 'Comment not found');
    }

    // 如果該留言有 children，就要先遞迴刪除該留言的所有 children
    // 直到抓到最後一層 children 並刪除完畢後，才會回到上一層 children 接著刪除
    // 等所有 children 都刪除完後，最後才會刪除頭留言
    if (comment?.children.length) {
      // 使用 Promise.all 確保所有子評論都被刪除後再繼續
      // 如果不設定的話，map 會同時執行，這樣就無法保證所有子評論都被刪除
      await Promise.all(
        comment.children.map(async (replies) => {
          // 刪除的同時也要累加返回的 deleteCount，給下一個遞歸使用
          const childDeleteCount = await deleteCommentFunc({ commentObjectId: replies.toString(), deleteNum: 0 });
          deleteCount += childDeleteCount;
        }),
      );
    }

    // 如果是回覆留言
    if (comment?.parent) {
      // 先確認是否有該 parent comment
      const parentComment = await CommentSchema.findOne({ _id: comment.parent });

      if (!parentComment) {
        throw createHttpError(404, 'Parent comment not found');
      }

      // 記得要回到被回覆留言的 children 中刪除該回覆留言的 objectId
      const updateParentComment = await CommentSchema.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: commentObjectId } },
        { new: true },
      );

      if (!updateParentComment) {
        throw createHttpError(500, 'Failed to delete parent comment children');
      }
    }

    // 當然不管是頭留言還是回覆留言，都要刪除該留言的通知
    const deleteNotification = await NotificationSchema.findOneAndDelete({ comment: commentObjectId });

    // 如果刪除通知失敗，就回傳錯誤
    if (!deleteNotification) {
      throw createHttpError(500, 'Failed to delete comment notification');
    }

    // 與 notification 一樣，
    // 不管是頭留言還是回覆留言，都要更新 blog 的 comments 及 activity 資料
    // 更新後，如果該留言有 children，就要遞迴刪除該留言的 children
    // 這樣才能完全刪除該留言及其所有子留言
    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: comment?.blog_id },
      {
        $pull: { comments: commentObjectId },
        $inc: { 'activity.total_comments': -1, 'activity.total_parent_comments': comment?.parent ? 0 : -1 },
      },
    );

    // 如果更新 blog 資料失敗，就回傳錯誤
    if (!updateBlogInfo) {
      throw createHttpError(500, 'Failed to update blog comments info and activity info');
    }

    // 最後刪除該留言
    const deleteComment = await CommentSchema.findOneAndDelete({ _id: commentObjectId });

    // 如果刪除留言失敗，就回傳錯誤
    if (!deleteComment) {
      throw createHttpError(500, 'Failed to delete comment');
    }

    // 反之，如果找到該留言並成功刪除，就要增加 deleteCount
    // 方便後續回傳給前端知道刪除了幾筆留言
    deleteCount += 1;
  } catch (error) {
    console.log(error);
  }

  return deleteCount;
};

export const deleteCommentById: RequestHandler = (req, res, next) => {
  try {
    const { userId } = req;
    const { commentObjectId } = req.body;

    const deleteNum = 0;

    if (!userId) {
      throw createHttpError(401, 'Please login first');
    }

    if (!commentObjectId) {
      throw createHttpError(400, 'Please provide comment id from client');
    }

    // 首先找出目標留言ID的留言
    CommentSchema.findOne({ _id: commentObjectId })
      .then(async (comment) => {
        let deletedCommentNum;

        // 再確認該留言是否有刪除的權限
        // 比如說，只有留言者或是部落格作者才能刪除留言
        // 這裡需要注意的是，userId 是 string，而 comment.commented_by 是 ObjectId，兩者型別不同
        // 如果用 '===' 來比較就會報錯，因為 '===' 會一同比較型別及值
        // 所以這裡要改用 '==' 來比較，因為 '==' 只會比較值，不會比較型別
        // 當然，objectId 也提供了 equals 方法，接受一個 string 或 objectId 來比較
        // 如果接受的是 string，就會自動轉換成 objectId 來比較
        // 因此這裡的 comment?.blog_author?.equals(userId) 才會正確運作

        if (userId == comment?.commented_by || comment?.blog_author?.equals(userId)) {
          deletedCommentNum = await deleteCommentFunc({ commentObjectId, deleteNum });
        } else {
          throw createHttpError(403, 'You are not allowed to delete this comment');
        }

        res.status(200).json({ message: 'Comment deleted successfully', deletedCommentNum });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 更新留言
export const updateCommentById: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;
    const { commentObjectId, newCommentContent } = req.body;

    if (!userId) {
      throw createHttpError(401, 'Please login first');
    }

    if (!commentObjectId) {
      throw createHttpError(400, 'Please provide comment id from client');
    }

    if (!newCommentContent || !newCommentContent.length) {
      throw createHttpError(400, 'Please write something or provide new comment from client');
    }

    const targetCommentExist = await CommentSchema.findOne({ _id: commentObjectId, commented_by: userId });

    if (!targetCommentExist) {
      throw createHttpError(403, 'You are not allowed to update this comment');
    }

    const updateComment = await CommentSchema.findOneAndUpdate(
      { _id: commentObjectId, commented_by: userId },
      { comment: newCommentContent },
    );

    if (!updateComment) {
      throw createHttpError(500, 'Failed to update comment');
    }

    res.status(200).json({ message: 'Comment updated successfully', updateComment: updateComment });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
