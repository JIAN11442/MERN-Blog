/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import { ValidateForPublishBlog } from '../utils/validateController.util';
import { generateBlogID, generateTagsWithLimitNum } from '../utils/generate.util';
import env from '../utils/validateEnv.util';

import BlogSchema from '../schemas/blog.schema';
import UserSchema from '../schemas/user.schema';

const getLatestBlogLimit = env.GET_LATEST_BLOGS_LIMIT;

// 創建文章
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

// 取得最新的幾篇文章
export const getLatestBlogs: RequestHandler = async (req, res, next) => {
  try {
    // 1. 取得 draft 為 false，也就是不是草稿的那些 blogs
    // 2. 依照 publishedAt 降冪排序(大到小)，也就是最新的 blog 會在最前面
    // 3. 只選取 blog_id, title, banner, des, activity, tags, publishedAt 這些資料(還有 author 資料，也就是第 4 點)
    // 4. 並根據 author 的 id，移植或填充(populate)該 id 對應 schema 中 ref 對象(users)的數據，也就是作者資料到 author 中
    // 5. 限制回傳的數量

    const { page } = req.body;

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    const latestBlogs = await BlogSchema.find({ draft: false })
      .sort({ publishedAt: -1 })
      .select('blog_id title banner des activity tags publishedAt -_id')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .skip((page - 1) * env.GET_LATEST_BLOGS_LIMIT)
      .limit(getLatestBlogLimit);

    if (!latestBlogs) {
      throw createHttpError(500, 'No latest blogs found.');
    }

    res.status(200).json({ latestBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得特定 tag 最新的幾篇文章
export const getLatestBlogsBySearch: RequestHandler = async (req, res, next) => {
  try {
    const { category, query, page } = req.body;

    let findQuery = {};

    if (category) {
      findQuery = { tags: category, draft: false };
    } else if (query) {
      // title: new RegExp(query, 'i') 是一個正則表達式，
      // 用於匹配 title 中包含 query 的所有文檔，類似模糊查詢。而其中的 'i' 表示不區分大小寫
      // 另外，也可以寫成以下格式：
      // findQuery = { title: { $regex: query, $options: 'i' }, draft: false };
      findQuery = { title: new RegExp(query, 'i'), tags: new RegExp(query, 'i'), draft: false };
    }

    const tagBlogs = await BlogSchema.find(findQuery)
      .sort({ publishedAt: -1 })
      .select('blod_id title banner des activity tags publishedAt -_id')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .skip((page - 1) * env.GET_LATEST_BLOGS_LIMIT)
      .limit(getLatestBlogLimit);

    if (!tagBlogs) {
      throw createHttpError(500, 'No blogs found with this tag.');
    }

    res.status(200).json({ tagBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得熱門文章
export const getTrendingBlogs: RequestHandler = async (req, res, next) => {
  try {
    const { page } = req.body;

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    const trendingBlogs = await BlogSchema.find({ draft: false })
      .select('blog_id title publishedAt -_id')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .sort({ 'activity.total_read': -1, 'activity.total_likes': -1, publishedAt: -1 })
      .skip((page - 1) * env.GET_TRENDING_BLOGS_LIMIT)
      .limit(env.GET_TRENDING_BLOGS_LIMIT);

    if (!trendingBlogs) {
      throw createHttpError(500, 'No trending blogs found.');
    }

    res.status(200).json({ trendingBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得熱門 tag
export const getTrendingTags: RequestHandler = async (req, res, next) => {
  try {
    const trendingTags = await BlogSchema.find()
      .select('tags -_id')
      .distinct('tags')
      .sort({ 'activity.total_read': -1, 'activity.total_liked': -1, publishedAt: -1 });

    if (!trendingTags) {
      throw createHttpError(500, 'No trending tags found.');
    }

    const randomLimitTags = generateTagsWithLimitNum(trendingTags, env.GET_TRENDING_TAGS_LIMIT);

    res.status(200).json({ trendingTags: randomLimitTags });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得最新文章數量
export const getLatestBlogsCount: RequestHandler = async (req, res, next) => {
  try {
    const latestBlogsCount = await BlogSchema.countDocuments({ draft: false });

    res.status(200).json({ totalDocs: latestBlogsCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得特定 tag 最新文章數量
export const getLatestBlogsBySearchCount: RequestHandler = async (req, res, next) => {
  try {
    const { tag, query } = req.body;

    const tagBlogsCount = await BlogSchema.countDocuments({ tags: tag || query, draft: false });

    res.status(200).json({ totalDocs: tagBlogsCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
