import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import {
  createBlog,
  getLatestBlogs,
  getLatestBlogsByTag,
  getTrendingBlogs,
  getTrendingTags,
} from '../controllers/blogs.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);
blogRoute.get('/latest-blogs', getLatestBlogs);
blogRoute.post('/tag-latest-blogs', getLatestBlogsByTag);
blogRoute.get('/trending-blogs', getTrendingBlogs);
blogRoute.get('/trending-tags', getTrendingTags);

export default blogRoute;
