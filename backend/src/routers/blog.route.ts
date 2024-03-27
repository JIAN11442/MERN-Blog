import express from 'express';

import { jwtVerify } from '../controllers/users.controller';
import { createBlog } from '../controllers/blog.controller';

const blogRoute = express.Router();

blogRoute.post('/create-blog', jwtVerify, createBlog);

export default blogRoute;
