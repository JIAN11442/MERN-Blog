import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import { createBlog, getLatestBlogs, getLatestBlogsByTag, getTrendingBlogs } from '../controllers/blogs.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);
blogRoute.get('/latest-blogs', getLatestBlogs);
blogRoute.post('/tag-latest-blogs', getLatestBlogsByTag);
blogRoute.get('/trending-blogs', getTrendingBlogs);

export default blogRoute;
