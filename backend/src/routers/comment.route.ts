import express from 'express';
import { getCommentsByBlogId, createNewComment, deleteCommentById } from '../controllers/comment.controller';
import { jwtVerify } from '../controllers/auth.controller';

const commentRoute = express.Router();

commentRoute.post('/get-blog-comments', getCommentsByBlogId);
commentRoute.post('/create-new-comment', jwtVerify, createNewComment);
commentRoute.post('/delete-target-comment', jwtVerify, deleteCommentById);

export default commentRoute;
