import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import {
  createBlog,
  getLatestBlogs,
  getLatestBlogsByCategory,
  getLatestBlogsByQuery,
  getTrendingBlogs,
  getTrendingTags,
  getLatestBlogsCount,
  getLatestBlogsByCategoryCount,
  getLatestBlogsByQueryCount,
} from '../controllers/blog.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);

blogRoute.post('/latest-blogs', getLatestBlogs);
blogRoute.get('/latest-blogs-count', getLatestBlogsCount);

blogRoute.post('/category-latest-blogs', getLatestBlogsByCategory);
blogRoute.post('/query-latest-blogs', getLatestBlogsByQuery);
blogRoute.post('/category-latest-blogs-count', getLatestBlogsByCategoryCount);
blogRoute.post('/query-latest-blogs-count', getLatestBlogsByQueryCount);

blogRoute.post('/trending-blogs', getTrendingBlogs);
blogRoute.get('/trending-tags', getTrendingTags);

export default blogRoute;
