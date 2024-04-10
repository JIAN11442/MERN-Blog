/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import { ValidateForPublishBlog } from '../utils/validateController.util';
import { generateBlogID } from '../utils/generate.util';
import env from '../utils/validateEnv.util';

import BlogSchema from '../schemas/blog.schema';
import UserSchema from '../schemas/user.schema';

const getLatestBlogLimit = env.GET_LATEST_BLOGS_LIMIT;

export const createBlog: RequestHandler = async (req, res, next) => {
  try {
    // 因為在執行 createBlog 前已執行 jwtVerify controller,
    // 所以可以從 req.userId 中取得 user id 作為 authorId
    const authorId = req.userId;
    const { banner, title, content, des, draft } = req.body;

    const validateResult = ValidateForPublishBlog(req.body);

    // 檢查各個資料是否有值且符合格式
    if (validateResult !== true) {
      throw createHttpError(validateResult.statusCode, validateResult.message);
    }

    // 將 tags 轉為小寫
    const tags = req.body.tags.map((t: string) => t.toLowerCase());

    // 根據 title 產生 blog id
    const blogId = generateBlogID(title);

    // 上傳 Blog 資料到資料庫
    const newBlog = await BlogSchema.create({
      banner,
      title,
      content,
      des,
      tags,
      author: authorId,
      blog_id: blogId,
      draft: Boolean(draft),
    });

    // 如果上傳失敗，拋出錯誤
    if (!newBlog) {
      throw createHttpError(500, 'Failed to create blog.');
    }

    // 如果 draft 為 true，則不增加 user 的 total_posts
    const incrementVal = draft ? 0 : 1;

    // 更新 user 的 total_posts 和與該 user 有關的 blog
    const updatedUserInfo = await UserSchema.findOneAndUpdate(
      { _id: authorId },
      { $inc: { 'account_info.total_posts': incrementVal }, $push: { blogs: newBlog._id } },
    );

    // 如果更新失敗，拋出錯誤
    if (!updatedUserInfo) {
      throw createHttpError(500, "Failed to update total posts number in user's account info.");
    }

    // 反之，回傳成功訊息
    res.status(200).json({ message: 'Blog created successfully', blogId: newBlog.blog_id });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getLatestBlogs: RequestHandler = async (req, res, next) => {
  try {
    const latestBlogs = await BlogSchema.find({ draft: true })
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .sort({ publishedAt: -1 })
      .select('blog_id title')
      .limit(getLatestBlogLimit);

    if (!latestBlogs) {
      throw createHttpError(404, 'No latest blogs found.');
    }

    res.status(200).json({ latestBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
