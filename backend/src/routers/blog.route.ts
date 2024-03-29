import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import { createBlog } from '../controllers/blogs.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);

export default blogRoute;
