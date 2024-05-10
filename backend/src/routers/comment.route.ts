import express from 'express';
import { getCommentsByBlogId, createNewComment } from '../controllers/comment.controller';
import { jwtVerify } from '../controllers/auth.controller';

const commentRoute = express.Router();

commentRoute.post('/get-blog-comments', getCommentsByBlogId);
commentRoute.post('/create-new-comment', jwtVerify, createNewComment);

export default commentRoute;
