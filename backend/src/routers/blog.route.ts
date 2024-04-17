import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import {
  createBlog,
  getLatestBlogs,
  getLatestBlogsBySearch,
  getTrendingBlogs,
  getTrendingTags,
  getLatestBlogsCount,
  getLatestBlogsBySearchCount,
} from '../controllers/blogs.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);

blogRoute.post('/latest-blogs', getLatestBlogs);
blogRoute.get('/latest-blogs-count', getLatestBlogsCount);

blogRoute.post('/search-latest-blogs', getLatestBlogsBySearch);
blogRoute.post('/search-latest-blogs-count', getLatestBlogsBySearchCount);

blogRoute.post('/trending-blogs', getTrendingBlogs);
blogRoute.get('/trending-tags', getTrendingTags);

export default blogRoute;
