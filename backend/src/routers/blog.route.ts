import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import {
  createBlog,
  getLatestBlogs,
  getLatestBlogsByTag,
  getTrendingBlogs,
  getTrendingTags,
  getLatestBlogsCount,
  getLatestBlogsByTagCount,
} from '../controllers/blogs.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);
blogRoute.post('/latest-blogs', getLatestBlogs);
blogRoute.post('/tag-latest-blogs', getLatestBlogsByTag);
blogRoute.post('/tag-latest-blogs-count', getLatestBlogsByTagCount);
blogRoute.post('/trending-blogs', getTrendingBlogs);

blogRoute.get('/latest-blogs-count', getLatestBlogsCount);
blogRoute.get('/trending-tags', getTrendingTags);

export default blogRoute;
