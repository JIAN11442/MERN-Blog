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

// 創建新的頭留言
export const createNewComment: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req;

    const { blogObjectId, comment: reqComment, blog_author } = req.body;

    if (!blogObjectId) {
      throw createHttpError(400, 'Please provide blog objectId from client');
    }

    if (!blog_author) {
      throw createHttpError(400, 'Please provide blog author id from client');
    }
    if (!reqComment.length) {
      throw createHttpError(400, 'Write something to leave a comment');
    }

    const newComment = await CommentSchema.create({
      blog_id: blogObjectId,
      blog_author,
      comment: reqComment,
      commented_by: userId,
    });

    if (!newComment) {
      throw createHttpError(500, 'Failed to create new comment');
    }

    const { comment, commentedAt, children } = newComment as unknown as NewCommentType;

    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: blogObjectId },
      {
        $push: { comments: newComment._id },
        $inc: { 'activity.total_comments': 1, 'activity.total_parent_comments': 1 },
      },
    );

    if (!updateBlogInfo) {
      throw createHttpError(500, 'Failed to update blog comments info and activity info');
    }

    const newCommentNotification = await NotificationSchema.create({
      type: 'comment',
      blog: blogObjectId,
      notification_for: blog_author,
      user: userId,
      comment: newComment._id,
    });

    if (!newCommentNotification) {
      throw createHttpError(500, 'Failed to create new comment notification');
    }

    res.status(200).json({ comment, commentedAt, _id: newComment._id, children });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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
