import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import { getLikeStatusByUserId, updateTotalLikesByUserId } from '../controllers/liked.controller';

const likedRoute = express.Router();

likedRoute.post('/like-blog', jwtVerify, updateTotalLikesByUserId);
likedRoute.post('/get-user-like-status', jwtVerify, getLikeStatusByUserId);

export default likedRoute;
