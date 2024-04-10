import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import { createBlog, getLatestBlogs } from '../controllers/blogs.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);
blogRoute.get('/latest-blogs', getLatestBlogs);

export default blogRoute;
