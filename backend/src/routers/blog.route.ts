import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import {
  createBlog,
  getLatestBlogs,
  getLatestBlogsByCategory,
  getLatestBlogsByQuery,
  getLatestBlogsByAuthor,
  getTrendingBlogs,
  getTrendingTags,
  getLatestBlogsCount,
  getLatestBlogsByCategoryCount,
  getLatestBlogsByQueryCount,
  getLatestBlogsByAuthorCount,
} from '../controllers/blog.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);

blogRoute.post('/latest-blogs', getLatestBlogs);
blogRoute.get('/latest-blogs-count', getLatestBlogsCount);

blogRoute.post('/category-latest-blogs', getLatestBlogsByCategory);
blogRoute.post('/category-latest-blogs-count', getLatestBlogsByCategoryCount);

blogRoute.post('/query-latest-blogs', getLatestBlogsByQuery);
blogRoute.post('/query-latest-blogs-count', getLatestBlogsByQueryCount);

blogRoute.post('/author-latest-blogs', getLatestBlogsByAuthor);
blogRoute.post('/author-latest-blogs-count', getLatestBlogsByAuthorCount);

blogRoute.post('/trending-blogs', getTrendingBlogs);
blogRoute.get('/trending-tags', getTrendingTags);

export default blogRoute;
