/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const { banner, title, content, des, draft, paramsBlogId } = req.body;

    const validateResult = ValidateForPublishBlog(req.body);

    // 檢查各個資料是否有值且符合格式
    if (validateResult !== true) {
      throw createHttpError(validateResult.statusCode, validateResult.message);
    }

    // 將 tags 轉為小寫
    const tags = req.body.tags.map((t: string) => t.toLowerCase());

    // 如果是從編輯狀態那 publish，應該會得到原本的 blogId，這樣就不需要重新生成
    // 如果是從創建狀態那 publish， 根據 title 產生 blog id
    const generateBlogId = paramsBlogId || generateBlogID(title);

    if (paramsBlogId) {
      // 如果是編輯狀態，更新該 blog 的資料
      const updatedBlog = await BlogSchema.findOneAndUpdate(
        { blog_id: generateBlogId },
        { banner, title, content, des, tags, draft: Boolean(draft) },
      );

      // 如果更新失敗，拋出錯誤
      if (!updatedBlog) {
        throw createHttpError(500, 'Failed to update blog.');
      }

      // 反之，回傳成功訊息
      res.status(200).json({ message: 'Blog updated successfully', blogId: updatedBlog.blog_id });
    } else {
      // 如果是創建狀態，則上傳 Blog 資料到資料庫
      const newBlog = await BlogSchema.create({
        banner,
        title,
        content,
        des,
        tags,
        author: authorId,
        blog_id: generateBlogId,
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
    }
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
export const getLatestBlogsByCategory: RequestHandler = async (req, res, next) => {
  try {
    const { category, page } = req.body;

    if (!category) {
      throw createHttpError(400, 'Please provide a category from client.');
    }

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    const tagBlogs = await BlogSchema.find({ tags: category, draft: false })
      .sort({ publishedAt: -1 })
      .select('blog_id title banner des activity tags publishedAt -_id')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .skip((page - 1) * getLatestBlogLimit)
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

// 取得 title 包含 query 的最新幾篇文章
export const getLatestBlogsByQuery: RequestHandler = async (req, res, next) => {
  try {
    const { query, page } = req.body;

    if (!query) {
      throw createHttpError(400, 'Please provide a query from client.');
    }

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    // title: new RegExp(query, 'i') 是一個正則表達式，
    // 用於匹配 title 中包含 query 的所有文檔，類似模糊查詢。而其中的 'i' 表示不區分大小寫
    // 另外，也可以寫成以下格式：
    // findQuery = { title: { $regex: query, $options: 'i' }, draft: false };

    const queryBlogs = await BlogSchema.find({ title: new RegExp(query, 'i'), draft: false })
      .sort({ publishedAt: -1 })
      .select('blog_id title banner des activity tags publishedAt -_id')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .skip((page - 1) * getLatestBlogLimit)
      .limit(getLatestBlogLimit);

    if (!queryBlogs) {
      throw createHttpError(500, 'No blogs found with this query.');
    }

    res.status(200).json({ queryBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得特定 author 最新的幾篇文章
export const getLatestBlogsByAuthor: RequestHandler = async (req, res, next) => {
  try {
    const { authorId, page } = req.body;

    if (!authorId) {
      throw createHttpError(400, 'Please provide an author id from client.');
    }

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    const authorBlogs = await BlogSchema.find({ author: authorId, draft: false })
      .sort({ publishedAt: -1 })
      .select('blog_id title banner des activity tags publishedAt')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .skip((page - 1) * getLatestBlogLimit)
      .limit(getLatestBlogLimit);

    if (!authorBlogs) {
      throw createHttpError(500, 'No blogs found with this author.');
    }

    res.status(200).json({ authorBlogs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得目標 blogId 的資料
export const getBlogDataByBlogId: RequestHandler = async (req, res, next) => {
  try {
    const { blogId, draft, mode } = req.body;

    // 如果沒有 blogId，拋出錯誤
    if (!blogId) {
      throw createHttpError(400, 'Please provide a blog id from client.');
    }

    // 如果 mode 是 edit，則 incrementVal 為 0，否則為 1
    const incrementVal = mode !== 'edit' ? 1 : 0;

    // 如果是創建狀態，將該 blog 的 total_reads 加 1 (incrementVal)，並回傳該 blog 的資料
    // 如果是編輯狀態，則該 blog 的 total_reads 加 0 (incrementVal)，並回傳該 blog 的資料
    const blogData = await BlogSchema.findOneAndUpdate(
      { blog_id: blogId },
      { $inc: { 'activity.total_reads': incrementVal } },
    )
      .populate('author', 'personal_info.fullname personal_info.username personal_info.profile_img')
      .select('blog_id title des content banner activity tags publishedAt');

    // 如果沒有該 blog，拋出錯誤
    if (!blogData) {
      throw createHttpError(500, 'No blog found with this id.');
    }

    // 接著將與該 blog 有關的 user 的 total_reads 加 1
    // 因為 blog 中的 author 是一個 user 的 id，即使後來經過 populate, typescript 也不會自動將其識別為對應的 author.personal_info... 類型
    // 所以這裡需要特別將其轉換為 any 類型，以便取得 author 的 personal_info.username

    await UserSchema.findOneAndUpdate(
      { 'personal_info.username': (blogData as any).author.personal_info.username },
      { $inc: { 'account_info.total_reads': incrementVal } },
    ).catch((error) => {
      // 如果更新失敗，拋出錯誤
      console.log(error);
      throw createHttpError(500, 'Failed to update total reads number in user account info.');
    });

    // 如果該 blog 是草稿，但我們傳遞的 draft 為 false 時，拋出錯誤且不回傳該 blog 的資料
    if (blogData.draft && !draft) {
      throw createHttpError(500, 'you can not access draft blog.');
    }

    // 取得資料且成功更新 user 中的 total_reads 後，回傳該 blog 的資料
    res.status(200).json({ blogData });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得與目標 blogId 相似 tag 分類的所有 blogs 資料
export const getSimilarBlogsByTargetBlog: RequestHandler = async (req, res, next) => {
  try {
    // 從 req.body 中取得 categories, limit, page, eliminate_blogId
    const { categories, limit, page, eliminate_blogId } = req.body;

    // 如果沒有 limit，則使用預設的 getLatestBlogLimit
    const limitNum = limit || getLatestBlogLimit;

    // 如果沒有 categories, page, eliminate_blogId，則拋出錯誤
    if (!categories) {
      throw createHttpError(400, 'Please provide a categories from client.');
    }

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    if (!eliminate_blogId) {
      throw createHttpError(400, 'Please provide a eliminate blog id from client.');
    }

    // 先確認 eliminate_blogId 是否存在，並取得其 tags
    const eliminateBlog = await BlogSchema.findOne({ blog_id: eliminate_blogId }).select('tags -_id');

    // 如果找不到 eliminateBlog，則拋出錯誤
    if (!eliminateBlog) {
      throw createHttpError(500, 'No eliminate blog found with this id.');
    }

    // 接著確認 eliminateBlog 的 tags 是否有任何與 categories 相符的 tag
    if (!eliminateBlog.tags.some((tag) => categories.includes(tag))) {
      throw createHttpError(500, 'No similar blogs found with tags of target blog.');
    }

    // 最後，根據 categories 找出相似的 blogs
    // $in: categories 表示 tags 中包含 categories 中任何一個 tag 的 blog 都納入篩選
    // $ne: eliminate_blogId 表示 blog_id 不等於 eliminate_blogId 的 blog 都納入篩選
    const similarBlogs = await BlogSchema.find({
      tags: { $in: categories },
      draft: false,
      blog_id: { $ne: eliminate_blogId },
    })
      .sort({ publishedAt: -1 })
      .select('blog_id title banner des activity tags publishedAt -_id')
      .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
      .skip((page - 1) * limitNum)
      .limit(limitNum);

    if (!similarBlogs) {
      throw createHttpError(500, 'No similar blogs found with tags of target blog.');
    }

    res.status(200).json({ similarBlogs });
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
      .sort({ 'activity.total_reads': -1, 'activity.total_likes': -1, publishedAt: -1 })
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

// 取得熱門 tags
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

// 取得所有特定 tag 最新文章的數量
export const getLatestBlogsByCategoryCount: RequestHandler = async (req, res, next) => {
  try {
    const { category } = req.body;

    const tagBlogsCount = await BlogSchema.countDocuments({ tags: category, draft: false });

    res.status(200).json({ totalDocs: tagBlogsCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得所有 query 最新文章的數量
export const getLatestBlogsByQueryCount: RequestHandler = async (req, res, next) => {
  try {
    const { query } = req.body;

    const queryBlogsCount = await BlogSchema.countDocuments({ title: new RegExp(query, 'i'), draft: false });

    res.status(200).json({ totalDocs: queryBlogsCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得所有 author 最新文章的數量
export const getLatestBlogsByAuthorCount: RequestHandler = async (req, res, next) => {
  try {
    const { authorId } = req.body;

    if (!authorId) {
      throw createHttpError(400, 'Please provide an author id from client.');
    }

    const authorBlogsCount = await BlogSchema.countDocuments({ author: authorId, draft: false });

    res.status(200).json({ totalDocs: authorBlogsCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
